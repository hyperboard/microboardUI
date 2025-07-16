import styles from "../ImportMiro.module.css";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { Notification } from "shared/ui-lib/Notification";
import { InfoColor } from "shared/ui-lib/Notification/Notification";
import { useUiModalContext } from "shared/ui-lib/UiModal";

interface SuccessNotificationProps {
  className?: string;
}

export const SUCCESS_NOTIFICATION = Symbol("successNotification");

export const SuccessNotification = ({
  className,
}: SuccessNotificationProps): React.ReactElement => {
  const { t } = useTranslation();
  const { isModalOpen, closeModal } = useUiModalContext();
  const isOpen = isModalOpen(SUCCESS_NOTIFICATION);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeModal();
      }, 10000);
    }
  }, [isOpen]);

  return (
    <Notification
      isOpen={isOpen}
      className={className}
      setIsOpen={closeModal}
      infoIcon
      infoColor={InfoColor.success}
      cross
    >
      <div className={styles.notificationWr}>
        <h4 className={styles.notificationTitle}>
          {t("miro.notifications.success")}
        </h4>
        <UiButton
          variant="quaternary"
          onClick={closeModal}
          className={styles.notificationBtn}
          size="lg"
        >
          {t("miro.notifications.okBtn")}
        </UiButton>
      </div>
    </Notification>
  );
};
