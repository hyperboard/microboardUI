import React from "react";
import {
  InfoColor,
  Notification,
} from "shared/ui-lib/Notification/Notification";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import styles from "./Notifications.module.css";
import { useTranslation } from "react-i18next";

export const ERROR_SIGNIN_NOTIFY = Symbol("errorSignin");

export const SigninErrorNotification = (): JSX.Element => {
  const { isModalOpen, closeModal } = useUiModalContext();
  const { t } = useTranslation();

  return (
    <Notification
      isOpen={isModalOpen(ERROR_SIGNIN_NOTIFY)}
      setIsOpen={closeModal}
      infoColor={InfoColor.error}
      infoIcon
      cross
    >
      <div className={styles.notificationWr}>
        <h3 className={styles.notificationTitle}>
          {t("auth.signinNotifyError.title")}
        </h3>
        <p className={styles.notificationText}>
          {t("auth.signinNotifyError.text")}
        </p>
      </div>
    </Notification>
  );
};
