import { useAccount } from "App/useAccount";
import { PasswordChanged } from "features/Widgets/form-notifications/password-changed";
import React, { useRef, useState, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ChangePassword.module.css";
import { Input } from "shared/ui-lib/Input";
import { UiButton } from "shared/ui-lib/UiButton";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { PROFILE_SETTINGS_MODAL_ID } from "features/ProfileSettingsModal";
import { Icon } from "shared/ui-lib/Icon";
import { LockIcon } from "pages/SignupPage/LockIcon";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const CHANGE_PASSWORD_MODAL = Symbol("ChangePasswordModal");

export function ChangePasswordModal(): React.JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const { t } = useTranslation();
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const account = useAccount();
  const { openModal } = useUiModalContext();

  const closeModal: MouseEventHandler = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    openModal(PROFILE_SETTINGS_MODAL_ID);
    const form = formRef.current;
    if (!form) {
      return;
    }

    form.reset();
    setIsSubmitDisabled(true);
    setConfirmPasswordError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
  };

  const onSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) {
      return;
    }

    setIsSubmitDisabled(true);
    setIsSubmitLoading(true);

    account
      .changePassword(form.currentPassword.value, form.newPassword.value)
      .then(() => {
        setIsPasswordChanged(true);
      })
      .catch((error) => {
        if (error?.message === "Wrong password") {
          setCurrentPasswordError(t("auth.currentPasswordIsIncorrect"));
          return;
        }
        if (error?.message === "ERROR_SAME_PASSWORD") {
          setNewPasswordError(t("auth.passwordMustBeDifferent"));
          return;
        }
        // different error?
        setConfirmPasswordError(t("auth.passwordDoNotMatch"));
      })
      .finally(() => {
        setIsSubmitDisabled(false);
        setIsSubmitLoading(false);
      });
  };

  const checkForm = () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    setConfirmPasswordError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setIsSubmitDisabled(false);

    if (currentPassword === "") {
      setCurrentPasswordError("");
      setIsSubmitDisabled(true);
    }

    if (newPassword === "") {
      setNewPasswordError("");
      setIsSubmitDisabled(true);
    }

    if (confirmPassword === "") {
      setConfirmPasswordError("");
      setIsSubmitDisabled(true);
    }

    const MIN_PASSWORD_LENGTH = 8;
    if (currentPasswordTouched) {
      if (currentPassword.length < MIN_PASSWORD_LENGTH) {
        setCurrentPasswordError(t("profile.passwordConstraint"));
        setIsSubmitDisabled(true);
      }
    }
    if (newPasswordTouched) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        setNewPasswordError(t("profile.passwordConstraint"));
        setIsSubmitDisabled(true);
      }
      if (newPassword === currentPassword) {
        setNewPasswordError(t("auth.passwordMustBeDifferent"));
        setIsSubmitDisabled(true);
      }
    }

    if (confirmPasswordTouched) {
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError(t("auth.passwordDoNotMatch"));
        setIsSubmitDisabled(true);
      }
    }
  };

  const handleCurrentPasswordInput = (): void => {
    const form = formRef.current;
    if (!form) return;

    const currentPassword = form.currentPassword.value;
    const MIN_PASSWORD_LENGTH = 8;

    // Validate current password during typing
    if (
      currentPasswordTouched &&
      currentPassword &&
      currentPassword.length < MIN_PASSWORD_LENGTH
    ) {
      setCurrentPasswordError(t("profile.passwordConstraint"));
    } else {
      setCurrentPasswordError("");
    }

    // Also check overall form validity
    checkForm();
  };

  const handleNewPasswordInput = (): void => {
    const form = formRef.current;
    if (!form) return;

    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const MIN_PASSWORD_LENGTH = 8;

    // Validate new password during typing
    if (
      newPasswordTouched &&
      newPassword &&
      newPassword.length < MIN_PASSWORD_LENGTH
    ) {
      setNewPasswordError(t("profile.passwordConstraint"));
    } else if (
      newPasswordTouched &&
      newPassword &&
      newPassword === currentPassword
    ) {
      setNewPasswordError(t("auth.passwordMustBeDifferent"));
    } else {
      setNewPasswordError("");
    }

    // Also check overall form validity
    checkForm();
  };

  const handleConfirmPasswordInput = (): void => {
    const form = formRef.current;
    if (!form) return;

    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    // Validate confirm password during typing
    if (
      confirmPasswordTouched &&
      newPassword &&
      confirmPassword &&
      newPassword !== confirmPassword
    ) {
      setConfirmPasswordError(t("auth.passwordDoNotMatch"));
    } else {
      setConfirmPasswordError("");
    }

    // Also check overall form validity
    checkForm();
  };

  if (isPasswordChanged) {
    return (
      <UiModal modalId={CHANGE_PASSWORD_MODAL}>
        <div className={styles.modalWrapper}>
          <div className={styles.modal}>
            <PasswordChanged />
            <div className={styles.passwordChangedGap}></div>
          </div>
        </div>
      </UiModal>
    );
  }

  return (
    <UiModal modalId={CHANGE_PASSWORD_MODAL}>
      <div className={styles.modal}>
        <UiButton
          onClick={closeModal}
          className={styles.backBtn}
          variant="ghost"
          size="lg"
        >
          <Icon width={20} height={20} iconName="BackArrow" />{" "}
          {t("profile.title")}
        </UiButton>
        <h2 className={styles.modalTitle}>{t("profile.changePassword")}</h2>
        <form className={styles.modalForm} ref={formRef} onSubmit={onSubmit}>
          <div className={styles.modalInputs}>
            <Input
              prefixIcon={<LockIcon />}
              id="currentPassword"
              password
              hasError={!!currentPasswordError}
              placeholder={t("profile.currentPassword")}
              onInput={handleCurrentPasswordInput}
              onBlur={checkForm}
              onFocus={() => {
                setCurrentPasswordTouched(true);
                checkForm();
              }}
            />
            <Input
              prefixIcon={<LockIcon />}
              id="newPassword"
              password
              onFocus={() => {
                setNewPasswordTouched(true);
                checkForm();
              }}
              hasError={!!newPasswordError}
              placeholder={t("profile.newPassword")}
              onInput={handleNewPasswordInput}
              onBlur={checkForm}
            />
            <Input
              prefixIcon={<LockIcon />}
              id="confirmPassword"
              password
              onFocus={() => {
                setConfirmPasswordTouched(true);
                checkForm();
              }}
              placeholder={t("profile.repeatPassword")}
              onInput={handleConfirmPasswordInput}
              onBlur={checkForm}
              hasError={!!confirmPasswordError}
              helperText={
                !currentPasswordError &&
                !newPasswordError &&
                !confirmPasswordError
                  ? t("profile.passwordConstraint")
                  : ""
              }
              errorText={
                currentPasswordError || newPasswordError || confirmPasswordError
              }
            />
          </div>

          <div className={styles.modalBtns}>
            <UiButton
              type="submit"
              variant="primary"
              disabled={isSubmitDisabled}
              loading={isSubmitLoading}
              size="lg"
            >
              {t("profile.savePassword")} <Tail />
            </UiButton>
            <UiButton variant="ghost" onClick={closeModal} size="lg">
              {t("auth.cancel")}
            </UiButton>
          </div>
        </form>
      </div>
    </UiModal>
  );
}
