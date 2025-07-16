import styles from "../ImportMiro.module.css";
import { useTranslation } from "react-i18next";
import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { Notification } from "shared/ui-lib/Notification";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const ERROR_NOTIFICATION = Symbol("errorNotification");

interface ErrorNotificationProps {
  className?: string;
}

export const ErrorNotification = ({
  className,
}: ErrorNotificationProps): React.ReactElement => {
  const { t } = useTranslation();
  const { isModalOpen, closeModal } = useUiModalContext();

  return (
    <Notification
      isOpen={isModalOpen(ERROR_NOTIFICATION)}
      className={className}
      setIsOpen={closeModal}
      infoIcon
      cross
    >
      <div className={styles.notificationWr}>
        <h4 className={styles.notificationTitle}>
          {t("miro.notifications.errorTitle")}
        </h4>
        <p className={styles.notificationText}>
          {t("miro.notifications.errorItemsText")}
        </p>
        <div className={styles.notificationBtns}>
          <UiButton
            variant="quaternary"
            onClick={closeModal}
            className={styles.notificationBtn}
            size="lg"
          >
            {t("miro.notifications.okBtn")}
          </UiButton>
        </div>
      </div>
    </Notification>
  );
};
