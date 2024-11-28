import styles from "../ImportMiro.module.css";
import { useTranslation } from "react-i18next";
import React from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";
import { useModal } from "View/Modal/ModalProvider";

interface ErrorNotificationProps {
	className?: string;
}

export const ErrorNotification = ({
	className,
}: ErrorNotificationProps): React.ReactElement => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();

	return (
		<Notification
			isOpen={isModalOpen("errorNotification")}
			className={className}
			setIsOpen={() => hideModal("errorNotification")}
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
					<Button
						pattern="secondary"
						onClick={() => hideModal("errorNotification")}
						className={styles.notificationBtn}
					>
						{t("miro.notifications.okBtn")}
					</Button>
				</div>
			</div>
		</Notification>
	);
};
