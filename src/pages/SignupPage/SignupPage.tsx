import { useAccount } from "App/useAccount";
import { AuthForm } from "entities/account";
import { Icon } from "shared/ui-lib/Icon";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { UiButton } from "shared/ui-lib/UiButton";
import { Checkbox } from "shared/ui-lib/Checkbox";
import { Input } from "shared/ui-lib/Input/Input";
import { OuterLink } from "shared/ui-lib/OuterLink";
import isEmail from "validator/lib/isEmail";
import styles from "./SignupPage.module.css";
import { EmailIcon } from "./EmailIcon";
import { LockIcon } from "./LockIcon";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import {
  ERROR_SIGNUP_NOTIFY,
  SignupErrorNotification,
} from "features/Notifications";

export const SignupPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [showNameInput, setShowNameInput] = useState(true);
  const [username, setUsername] = useState("");
  const [newsletter, setNewsletter] = useState<boolean>(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const account = useAccount();
  const { openModal } = useUiModalContext();

  const next = (): void => {
    if (isDisabled) {
      return;
    }

    setShowNameInput(false);
    // Reset disabled state when moving to email/password step
    setIsDisabled(true);
    setError("");
    setEmailError("");

    // Validate form after a short delay to ensure inputs are rendered
    setTimeout(() => {
      checkForm();
    }, 100);
  };

  const checkForm = (): boolean => {
    const form = formRef.current;
    if (!form) {
      setIsDisabled(true);
      return false;
    }

    // Check if we're on the email/password step
    if (showNameInput) {
      return false;
    }

    const emailInput = form.email;
    const passwordInput = form.password;

    if (!emailInput || !passwordInput) {
      setIsDisabled(true);
      return false;
    }

    // Trim email value
    if (emailInput.value) {
      emailInput.value = emailInput.value.trim();
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    // Clear previous errors
    setError("");
    setEmailError("");

    // Check if both fields are filled
    if (!email || !password) {
      setIsDisabled(true);
      return false;
    }

    // Validate email format
    if (!isEmail(email)) {
      setIsDisabled(true);
      setEmailError(t("auth.enterAValidEmailAddress"));
      return false;
    }

    // Validate password length
    const MIN_PASSWORD_LENGTH = 8;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setIsDisabled(true);
      setError(t("auth.passwordAtLeast"));
      return false;
    }

    // If we reach here, both fields are valid
    setIsDisabled(false);
    return true;
  };

  const handleEmailInput = (): void => {
    const form = formRef.current;
    const email = form?.email?.value;

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
    const form = formRef.current;
    const password = form?.password?.value;

    const MIN_PASSWORD_LENGTH = 8;

    // Validate password during typing
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.passwordAtLeast"));
    } else {
      setError("");
    }

    // Also check overall form validity
    checkForm();
  };

  const checkName = (val: string): void => {
    if (val.length < 1) {
      setError(t("auth.nameLengthShortError"));
      setIsDisabled(true);
      return;
    }
    if (val.length > 50) {
      setError(t("auth.nameLengthLongError"));
      setIsDisabled(true);
      return;
    }
    setIsDisabled(false);
    setError("");
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    // If we're on the name input step, validate name and move to next step
    if (showNameInput) {
      checkName(username);
      if (!username || error) {
        return;
      } else {
        setShowNameInput(false);
        return;
      }
    }

    // If we're on the email/password step, validate form and submit
    if (!checkForm()) {
      return;
    }

    setIsDisabled(true);
    setIsSubmitLoading(true);

    account
      .register(
        event.currentTarget.email.value,
        event.currentTarget.password.value,
        username,
        newsletter,
      )
      .then((res) => res.data)
      .catch((error) => {
        if (`${error?.status}` === "409") {
          setError(t("auth.userAlreadyExists"));
        }
      })
      .then((data) => {
        if (data) {
          const verifyParams = {
            ...Object.fromEntries(new URLSearchParams(location.search)),
            userId: `${data.id}`,
            ...(data.email ? { email: data.email } : {}),
          };
          navigate({
            pathname: "/auth/verify",
            search: createSearchParams(verifyParams).toString(),
          });
        }
      })
      .catch((error) => {
        // setErrorMessage(error.message);
        if (error.status === 500 || error.status === 400) {
          openModal(ERROR_SIGNUP_NOTIFY);
        }
      })
      .finally(() => {
        setIsDisabled(false);
        setIsSubmitLoading(false);
      });
  };

  const onNewsletterChange = (checked: boolean): void => setNewsletter(checked);

  return (
    <>
      <AuthForm
        onSubmit={onSubmit}
        ref={formRef}
        id="sign-up"
        title={t("auth.signUpForFree")}
        showAnotherAuthWay
      >
        {showNameInput ? (
          <Input
            id="name"
            onChange={(ev) => {
              setUsername(ev.target.value);
              checkName(ev.target.value);
            }}
            prefixIcon={<Icon iconName="human" width={20} height={20} />}
            iconColor="rgba(13, 17, 38, 0.4)"
            placeholder={t("auth.name")}
            hasError={!!error}
            errorText={error}
            helperText={error ? "" : t("auth.nameDesc")}
          />
        ) : (
          <>
            <Input
              prefixIcon={<EmailIcon />}
              id="email"
              type="text"
              placeholder={t("auth.emailPlaceholder")}
              onBlur={checkForm}
              onInput={handleEmailInput}
              onFocus={checkForm}
              hasError={!!emailError}
              errorText={emailError}
            />
            <Input
              prefixIcon={<LockIcon />}
              id="password"
              errorText={error}
              password
              hasError={!!error}
              placeholder={t("auth.passwordPlaceholder")}
              helperText={t("auth.passwordAtLeast")}
              onInput={handlePasswordInput}
              onFocus={checkForm}
              onBlur={checkForm}
            />
          </>
        )}

        <div className={styles.btns}>
          {showNameInput ? (
            <UiButton
              variant="primary"
              disabled={isDisabled}
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                next();
              }}
              size="lg"
            >
              {t("auth.next")}
            </UiButton>
          ) : (
            <>
              <Checkbox
                checked
                onChange={onNewsletterChange}
                className={styles.checkboxWr}
              >
                <span className={styles.newsletter}>
                  {t("auth.newsletter")}
                  <OuterLink
                    href={"https://microboard.io/privacy-policy"}
                    className={styles.newsletterLink}
                  >
                    {" "}
                    Microboard.io
                  </OuterLink>
                </span>
              </Checkbox>
              <UiButton
                type="submit"
                disabled={isDisabled}
                loading={isSubmitLoading}
                variant="primary"
                size="lg"
              >
                {t("auth.submit")}
                <Tail />
              </UiButton>
            </>
          )}
          <UiButton
            variant="ghost"
            onClick={(ev) => {
              ev.preventDefault();
              navigate(`/auth/sign-in${location.search}`);
            }}
            className={styles.login}
            type="button"
            size="lg"
          >
            {t("auth.signIn")}
          </UiButton>
        </div>
      </AuthForm>
      <SignupErrorNotification />
    </>
  );
};
