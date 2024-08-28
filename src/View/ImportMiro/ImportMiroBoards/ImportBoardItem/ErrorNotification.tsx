import styles from "../ImportMiroBoards.module.css";
import { useTranslation } from "react-i18next";
import React from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";

interface ErrorNotificationProps {
	className?: string;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const ErrorNotification = ({
	className,
	isOpen,
	setIsOpen,
}: ErrorNotificationProps): React.ReactElement => {
	const { t } = useTranslation();

	return (
		<Notification
			isOpen={isOpen}
			className={className}
			setIsOpen={setIsOpen}
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
						onClick={() => setIsOpen(false)}
						className={styles.notificationBtn}
					>
						{t("miro.notifications.okBtn")}
					</Button>
					<Button
						pattern="primary"
						onClick={() => setIsOpen(false)}
						className={styles.notificationBtn}
					>
						{t("miro.notifications.chooseBoardBtn")}
					</Button>
				</div>
			</div>
		</Notification>
	);
};
