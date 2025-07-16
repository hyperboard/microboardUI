import { useAccount } from "App/useAccount";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Link as RRDLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { UiButton } from "shared/ui-lib/UiButton";
import { Input } from "shared/ui-lib/Input";
import { Link } from "shared/ui-lib/Link";
import { PasswordChanged } from "features/Widgets/form-notifications/password-changed";
import styles from "./RestorePasswordPage.module.css";
import { AuthForm } from "entities/account";

export const RestorePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [newPassError, setNewPassError] = useState<string>("");
  const [error, setError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams, _] = useSearchParams();
  const [isPasswordChanged, setIsPasswordChanged] = useState<boolean>(false);
  const navigate = useNavigate();
  const account = useAccount();

  const checkForm = (): void => {
    const form = formRef.current;
    if (!form) {
      setIsDisabled(true);
      setError("");
      return;
    }
    const newPassword = form?.newPassword?.value;
    const repeatedPassword = form?.repeatedPassword?.value;
    if (!newPassword || !repeatedPassword) {
      setIsDisabled(true);
      setError("");
      return;
    }

    const MIN_PASSWORD_LENGTH = 8;

    if (repeatedPassword.length < MIN_PASSWORD_LENGTH) {
      setIsDisabled(true);
      setError("");
      return;
    }

    if (newPassword !== repeatedPassword) {
      setIsDisabled(true);
      setError(t("auth.passwordDoNotMatch"));
      return;
    }
    setError("");
    setIsDisabled(false);
  };

  const checkNewPassword = (): void => {
    const form = formRef.current;
    if (!form) {
      setIsDisabled(true);
      return;
    }
    const newPassword = form?.newPassword?.value;

    const MIN_PASSWORD_LENGTH = 8;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setIsDisabled(true);
      return;
    }

    setNewPassError("");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = formRef.current;

    if (!form) {
      return;
    }

    if (!searchParams.get("token")) {
      return;
    }

    setIsDisabled(true);
    setIsSubmitLoading(true);
    account
      .restorePassword(searchParams.get("token")!, form.newPassword.value)
      .then(() => {
        setIsPasswordChanged(true);
      })
      .catch((error) => {
        if (`${error?.status}` === "409") {
          setError(t("auth.passwordMustBeDifferent"));
          return;
        }
        setError(error?.message || "Unhandled error");
      })
      .finally(() => {
        setIsDisabled(false);
        setIsSubmitLoading(false);
      });
  };

  if (isPasswordChanged) {
    return (
      <div className={styles.passwordChanged}>
        <PasswordChanged />
        <UiButton
          onClick={() => navigate("/auth/sign-in")}
          variant="primary"
          size="lg"
          className={styles.btn}
        >
          {t("auth.backToLogIn")}
        </UiButton>
      </div>
    );
  }

  if (!searchParams.get("token")) {
    console.log("token not provided", searchParams);

    return (
      <div>
        <p className={styles.error}>
          {t("auth.restorationTokenIsNotProvided")}
        </p>
        <Link to="/auth/forgot-password">{t("auth.restorePassword")}</Link>
        <UiButton variant="primary" size="lg">
          <RRDLink to="/auth/sign-in" className={styles.link}>
            {t("common.backToMain")}
          </RRDLink>
        </UiButton>
      </div>
    );
  }

  return (
    <AuthForm
      ref={formRef}
      onSubmit={onSubmit}
      title={t("auth.resetPassword")}
      id="restore-password"
    >
      <Input
        password
        label={t("auth.passwordMustBeDifferent")}
        placeholder={t("auth.newPassword")}
        id="newPassword"
        errorText={newPassError}
        hasError={!!newPassError.length}
        onBlur={() => {
          checkForm();
          checkNewPassword();
        }}
      />
      <Input
        password
        placeholder={t("auth.newPassword")}
        id="repeatedPassword"
        onInput={checkForm}
        errorText={error}
        helperText={t("auth.passwordAtLeast")}
        hasError={!!error.length}
      />
      <div className={styles.btns}>
        <UiButton
          variant="primary"
          disabled={isDisabled}
          type="submit"
          className={styles.submit}
          loading={isSubmitLoading}
          size="lg"
        >
          {t("auth.submit")}
          <Tail />
        </UiButton>
        <UiButton
          variant="ghost"
          onClick={() => navigate("/auth/sign-in")}
          size="lg"
        >
          {t("auth.backToLogIn")}
        </UiButton>
      </div>
    </AuthForm>
  );
};
