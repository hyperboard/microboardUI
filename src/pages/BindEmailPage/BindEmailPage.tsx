import { LAST_BOARD_KEY_QS } from "App/App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { LockIcon } from "pages/SignupPage/LockIcon";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "shared/ui-lib/Input/Input";
import { UiButton } from "shared/ui-lib/UiButton";
import styles from "./BindEmailPage.module.css";

const secondsToHumanReadable = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const BindEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const account = useAccount();

  const formRef = useRef<HTMLFormElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string>("");
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [retryDisabled, setRetryDisabled] = useState<boolean>(false);
  const [isRetryLoading, setIsRetryLoading] = useState<boolean>(false);
  const [codeTip, setCodeTip] = useState<
    "auth.enterCodeBelow" | "auth.enterNewCodeBelow" | ""
  >("");
  const [isNewCode, setIsNewCode] = useState<boolean>(false);
  const [isAttemptsExceeded, setIsAttemptsExceeded] = useState<boolean>(false);
  const boardsList = useBoardsList();

  const onSuccess = async (): Promise<void> => {
    await account.fetchAccountInfo();
    await account.onLogin?.();
    if (searchParams.get("backToSelect") === "true") {
      navigate("/selectBoard");
    } else if (localStorage.getItem(LAST_BOARD_KEY_QS)) {
      navigate(`/boards/${localStorage.getItem(LAST_BOARD_KEY_QS)}`);
    } else {
      const boardId = await boardsList.createBoard();
      if (boardId) {
        navigate(`/boards/${boardId}`);
      }
    }
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const email = decodeURIComponent(searchParams.get("email") || "");
    const passcode = formRef.current?.code.value;
    if (!email || !passcode) {
      return;
    }

    setSubmitDisabled(true);
    setIsSubmitLoading(true);

    // Для привязки почты всегда вызываем verifyAddedEmail
    account
      .verifyAddedEmail(email, passcode)
      .then(onSuccess)
      .catch((error) => {
        console.error("error", error);
        if (error?.message === "PASSCODE_ATTEMPTS_EXCEEDED") {
          setIsAttemptsExceeded(true);
          setError(t("auth.errorVerificationCodeAttempts"));
          setSubmitDisabled(true);
          return;
        }
        setError(t("auth.errorVerificationCode"));
      })
      .finally(() => {
        setIsSubmitLoading(false);
        setSubmitDisabled(false);
      });
  };

  const checkForm = (checkAttempts = true): void => {
    if (checkAttempts && isAttemptsExceeded) {
      setError(t("auth.errorVerificationCodeAttempts"));
      setSubmitDisabled(true);
      return;
    }

    if (!formRef.current) {
      setSubmitDisabled(true);
      return;
    }

    const passcode: string = formRef.current.code.value;

    // Clear previous errors
    setError("");

    if (!passcode) {
      setSubmitDisabled(true);
      return;
    }

    if (passcode.length !== 6 || isNaN(parseInt(passcode))) {
      setSubmitDisabled(true);
      return;
    }

    // If we reach here, the code is valid
    setSubmitDisabled(false);
  };

  const handleInputChange = (): void => {
    // Immediate validation on every input change
    checkForm();
  };

  const onResend = async (): Promise<void> => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      return;
    }
    setRetryDisabled(true);
    setIsRetryLoading(true);

    account
      .resendMail(emailParam)
      .then(() => {
        setRetryCount(60 * 3);
        setIsAttemptsExceeded(false);
        setError("");
        setCodeTip("auth.enterNewCodeBelow");
        checkForm(false);
        if (formRef.current) {
          formRef.current.code.value = "";
        }
        setIsNewCode(true);
      })
      .catch((error) => {
        if (error?.message?.startsWith("Can retry after")) {
          try {
            const timeToResend = error.message.split(":")[1] / 1000;
            setRetryCount(parseInt(timeToResend.toFixed(0)));
          } catch (err) {
            console.log("no timer");
          }
          return;
        }
        // Если не найден passcode или пользователь – переходим на страницу аккаунта
        if (
          error?.message === "Passcode not found" ||
          error?.message === "User not found"
        ) {
          navigate("/account");
          return;
        }
      })
      .finally(() => {
        setRetryDisabled(false);
        setIsRetryLoading(false);
      });
  };

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) {
      return;
    }
    setRetryDisabled(true);
    setIsRetryLoading(true);
    account
      .checkVerificationCodes(emailParam)
      .then((data) => {
        if (data?.message === "PASSCODE_SENDED") {
          setRetryCount(60 * 3);
        }
        if (data?.message.startsWith("PASSCODE_NOT_SENDED")) {
          setRetryCount(0);
        }
      })
      .finally(() => {
        setRetryDisabled(false);
        setIsRetryLoading(false);
      });

    // Если в query-параметрах передан passcode – пытаемся сразу его верифицировать
    if (!searchParams.get("passcode")) {
      return;
    }
    setIsSubmitLoading(true);
    account
      .verifyAddedEmail(emailParam, searchParams.get("passcode") || "")
      .then(onSuccess)
      .catch((err) => {
        console.error("verify error", err);
        setError(t("auth.errorVerificationCode"));
      })
      .finally(() => {
        setIsSubmitLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRetryCount((prevCount) => (prevCount > 0 ? prevCount - 1 : prevCount));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit} className={styles.form} ref={formRef}>
        <h1 className={styles.title}>{t("auth.checkInbox")}</h1>
        <p className={styles.checkEmail}>
          {t("auth.weSentCode")}{" "}
          <span className={styles.email}>{searchParams.get("email")}</span>
          <br />
          {isNewCode ? t("auth.enterNewCodeBelow") : t("auth.enterCodeBelow")}
        </p>

        <Input
          prefixIcon={<LockIcon />}
          type="text"
          id="code"
          name="code"
          maxLength={6}
          placeholder={t("auth.codePlaceholder")}
          label={codeTip ? t(codeTip) : ""}
          hasError={!!error.length}
          errorText={error}
          onInput={handleInputChange}
          onFocus={handleInputChange}
          onBlur={handleInputChange}
        />
        <div className={styles.btns}>
          <UiButton
            disabled={isAttemptsExceeded || submitDisabled}
            type="submit"
            loading={isSubmitLoading}
            variant="primary"
            size="lg"
          >
            {t("auth.submit")}
            <Tail />
          </UiButton>
          <UiButton
            variant="ghost"
            disabled={retryDisabled || retryCount > 0}
            loading={isRetryLoading}
            type="button"
            onClick={onResend}
            size="lg"
          >
            {t("auth.resendCode")}{" "}
            {retryCount > 0 ? `(${secondsToHumanReadable(retryCount)})` : null}
          </UiButton>
        </div>
      </form>
    </div>
  );
};
