import styles from "../ImportMiroBoards.module.css";
import { useTranslation } from "react-i18next";
import React from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";
import { InfoColor } from "shared/ui-lib/Notification/Notification";

interface SuccessNotificationProps {
	className?: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const SuccessNotification = ({
	className,
	isOpen,
	setIsOpen,
}: SuccessNotificationProps): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<Notification
			isOpen={isOpen}
			className={className}
			setIsOpen={setIsOpen}
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
					onClick={() => setIsOpen(false)}
					className={styles.notificationBtn}
				>
					{t("miro.notifications.okBtn")}
				</Button>
			</div>
		</Notification>
	);
};
