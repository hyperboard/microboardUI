import { getApiUrl } from "Config";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { Input } from "shared/ui-lib/Input";
import styles from "./ForgotPasswordPage.module.css";
import { isEmail } from "shared/lib/regex";
import { useNavigate } from "react-router-dom";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { SuccessIcon } from "./SuccessIcon";

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const [requested, setRequested] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const checkForm = (): boolean => {
    if (!formRef.current) {
      setDisabled(true);
      return false;
    }

    const email = formRef.current.email.value;

    // Clear previous errors
    setError("");

    if (!email) {
      setDisabled(true);
      return false;
    }

    if (!isEmail(email)) {
      setDisabled(true);
      setError(t("auth.enterAValidEmailAddress"));
      return false;
    }

    // If we reach here, the email is valid
    setDisabled(false);
    return true;
  };

  const handleInputChange = (): void => {
    // Immediate validation on every input change
    checkForm();
  };

  const handleEmailInput = (): void => {
    const form = formRef.current;
    const email = form?.email?.value;

    // Validate email format during typing
    if (email && !isEmail(email)) {
      setError(t("auth.enterAValidEmailAddress"));
    } else {
      setError("");
    }

    // Also check overall form validity
    checkForm();
  };

  const checkFormWithError = (): void => {
    const isFormError = checkForm();

    if (!isFormError) {
      setError(t("auth.enterAValidEmailAddress"));
    } else {
      setError("");
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!formRef.current) {
      return;
    }
    setDisabled(true);
    setIsSubmitLoading(true);
    fetch(getApiUrl("/auth/password/restore/request"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formRef.current.email.value || "" }),
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          const data = await response.json();
          return Promise.reject(data);
        }
      })
      .then(() => {
        setRequested(true);
      })
      .catch((error) => {
        if (error?.message === "User not found") {
          setError(t("auth.userNotFound"));
          return;
        }
      })
      .finally(() => {
        setDisabled(false);
        setIsSubmitLoading(false);
      });
  };

  if (requested) {
    return (
      <div className={styles.requested}>
        <div>
          <SuccessIcon />
        </div>
        <h1 className={styles.resetPassword}>{t("auth.resetPassword")}</h1>
        <p className={styles.resetPasswordParagraph}>
          {t("auth.requestReceivedSuccessfully")}
        </p>
        <UiButton
          variant="primary"
          onClick={() => navigate(`/auth/sign-in${location.search}`)}
          className={styles.backToLogin}
          size="lg"
        >
          {t("auth.backToLogIn")}
        </UiButton>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <h1 className={styles.title}>{t("auth.forgotPassword")}</h1>
      <Input
        id="email"
        label={t("auth.enterEmailForLink")}
        placeholder={t("auth.emailPlaceholder")}
        hasError={!!error.length}
        errorText={error}
        onBlur={checkFormWithError}
        onInput={handleEmailInput}
        onFocus={checkForm}
      />
      <div className={styles.btns}>
        <UiButton
          type="submit"
          disabled={disabled}
          className={styles.submitBtn}
          loading={isSubmitLoading}
          variant="primary"
          size="lg"
        >
          {t("auth.submit")} <Tail />
        </UiButton>
        <UiButton
          variant="ghost"
          onClick={() => {
            navigate(`/auth/sign-in${location.search}`);
          }}
          size="lg"
        >
          {t("auth.backToLogIn")}
        </UiButton>
      </div>
    </form>
  );
};
