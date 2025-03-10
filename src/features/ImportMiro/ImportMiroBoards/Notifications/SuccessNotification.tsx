import styles from "../ImportMiro.module.css";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";
import { InfoColor } from "shared/ui-lib/Notification/Notification";
import { useModal } from "features/Modal/ModalProvider";

interface SuccessNotificationProps {
	className?: string;
}

export const SuccessNotification = ({
	className,
}: SuccessNotificationProps): React.ReactElement => {
	const { t } = useTranslation();
	const { isModalOpen, hideModal } = useModal();
	const isOpen = isModalOpen("successNotification");

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				hideModal("successNotification");
			}, 10000);
		}
	}, [isOpen]);

	return (
		<Notification
			isOpen={isOpen}
			className={className}
			setIsOpen={() => hideModal("successNotification")}
			infoIcon
			infoColor={InfoColor.success}
			cross
		>
			<div className={styles.notificationWr}>
				<h4 className={styles.notificationTitle}>
					{t("miro.notifications.success")}
				</h4>
				<Button
					pattern="secondary"
					onClick={() => hideModal("successNotification")}
					className={styles.notificationBtn}
				>
					{t("miro.notifications.okBtn")}
				</Button>
			</div>
		</Notification>
	);
};
