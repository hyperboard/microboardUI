import styles from "../ImportMiroBoards.module.css";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";
import { InfoColor } from "shared/ui-lib/Notification/Notification";
import { useModal } from "View/Modal/ModalProvider";

interface WarnClipboardNotificationProps {
	className?: string;
}

export const WarnClipboardNotification = ({
	className,
}: WarnClipboardNotificationProps): React.ReactElement => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();
	const isOpen = isModalOpen("warnClipboardNotification");

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				hideModal("warnClipboardNotification");
			}, 10000);
		}
	}, [isOpen]);

	return (
		<Notification
			isOpen={isOpen}
			className={className}
			setIsOpen={() => hideModal("warnClipboardNotification")}
			infoIcon
			infoColor={InfoColor.warn}
			cross
		>
			<div className={styles.notificationWr}>
				<h4 className={styles.notificationTitle}>
					{t("miro.notifications.success")}
				</h4>
				<p className={styles.notificationSuccessDescription}>
					{t("miro.notifications.warnClipboardDescription")}
				</p>
				<Button
					pattern="secondary"
					onClick={() => hideModal("warnClipboardNotification")}
					className={styles.notificationBtn}
				>
					{t("miro.notifications.okBtn")}
				</Button>
			</div>
		</Notification>
	);
};
