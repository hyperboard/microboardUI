import { LAST_BOARD_KEY_QS } from "App/App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { AuthForm } from "entities/account";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { EmailIcon } from "pages/SignupPage/EmailIcon";
import { LockIcon } from "pages/SignupPage/LockIcon";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { isEmail } from "shared/lib/regex";
import { UiButton } from "shared/ui-lib/UiButton";
import { Input } from "shared/ui-lib/Input/Input";
import styles from "./SigninPage.module.css";
import {
  ERROR_SIGNIN_NOTIFY,
  SigninErrorNotification,
} from "features/Notifications";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const SigninPage: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  const account = useAccount();
  const boards = useBoardsList();
  const { openModal } = useUiModalContext();

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const form = formRef.current;
    const email = form?.email.value;
    const password = form?.password.value;
    const searchParams = createSearchParams(window.location.search);

    setIsSubmitLoading(true);
    setSubmitDisabled(true);
    account
      .login(email, password)
      .then(async () => {
        setErrorText("");
        if (searchParams.get("backToSelect") === "true") {
          navigate("/selectBoard");
        } else if (localStorage.getItem(LAST_BOARD_KEY_QS)) {
          navigate(`/boards/${localStorage.getItem(LAST_BOARD_KEY_QS)}`);
        } else {
          const boardId = await boards.createBoard();
          if (boardId) {
            navigate(`/boards/${boardId}`);
          }
        }
        await account.fetchAccountInfo();
        await account.onLogin?.();
      })
      .catch((error) => {
        // setErrorMessage(error.message);
        console.log(error);
        console.log("sign in error:", error?.message === "User not activated");
        if (error.status === 400) {
          openModal(ERROR_SIGNIN_NOTIFY);
        }
        if (error?.message === "User not activated") {
          const form = formRef.current;
          const email = form?.email.value;
          navigate({
            pathname: "/auth/verify",
            search: createSearchParams({
              ...Object.fromEntries(searchParams),
              email: email,
            }).toString(),
          });
        } else {
          setErrorText(t("auth.incorrectEmailOrPassword"));
        }
      })
      .finally(() => {
        setIsSubmitLoading(false);
        setSubmitDisabled(false);
      });
  };

  const checkEmail = (): boolean => {
    if (formRef.current && formRef.current.email) {
      formRef.current.email.value = formRef.current.email.value.trim();
    }

    const email = formRef.current?.email.value;
    if (email && !isEmail(email)) {
      setEmailError(t("auth.enterAValidEmailAddress"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const checkForm = (): void => {
    const form = formRef.current;
    const email = form?.email.value;
    const password = form?.password.value;

    // Clear previous errors
    setErrorText("");

    // Check if both fields are filled
    if (!email || !password) {
      setSubmitDisabled(true);
      return;
    }

    // Validate email format
    if (!isEmail(email)) {
      setSubmitDisabled(true);
      setEmailError(t("auth.enterAValidEmailAddress"));
      return;
    }

    // If we reach here, both fields are valid
    setSubmitDisabled(false);
    setEmailError("");
  };

  const handleEmailInput = (): void => {
    const form = formRef.current;
    const email = form?.email.value;

    // Validate email format during typing
    if (email && !isEmail(email)) {
      setEmailError(t("auth.enterAValidEmailAddress"));
    } else {
      setEmailError("");
    }

    // Also check overall form validity
    checkForm();
  };

  const handlePasswordInput = (): void => {
    // For sign-in, we don't have specific password validation rules
    // but we still need to check form validity
    checkForm();
  };

  return (
    <>
      <AuthForm
        title={t("auth.signIn")}
        id="signin-form"
        onSubmit={onSubmit}
        ref={formRef}
        showPolicies
        showAnotherAuthWay
      >
        <Input
          id="email"
          prefixIcon={<EmailIcon />}
          placeholder={t("auth.emailPlaceholder")}
          hasError={!!emailError.length}
          errorText={emailError}
          onBlur={checkEmail}
          onInput={handleEmailInput}
          onFocus={checkForm}
        />
        <Input
          id="password"
          prefixIcon={<LockIcon />}
          placeholder={t("auth.passwordPlaceholder")}
          password
          onInput={handlePasswordInput}
          onFocus={checkForm}
          onBlur={checkForm}
          errorText={errorText}
          hasError={!!errorText}
        />

        <div className={styles.btns}>
          <UiButton
            type="submit"
            disabled={submitDisabled}
            loading={isSubmitLoading}
            variant="primary"
            size="lg"
          >
            {t("auth.submit")}
            <Tail />
          </UiButton>

          <UiButton
            variant="secondary"
            className={styles.forgot}
            onClick={() => navigate(`/auth/forgot-password${location.search}`)}
            size="lg"
          >
            {t("auth.forgotPassword")}
          </UiButton>

          <UiButton
            variant="ghost"
            onClick={() => navigate(`/auth/sign-up${location.search}`)}
            size="lg"
          >
            {t("auth.signUpForFree")}
          </UiButton>
        </div>
      </AuthForm>
      <SigninErrorNotification />
    </>
  );
};
