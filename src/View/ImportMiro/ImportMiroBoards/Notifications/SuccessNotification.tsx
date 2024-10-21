import styles from "../ImportMiroBoards.module.css";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { Button } from "shared/ui-lib/Button";
import { Notification } from "shared/ui-lib/Notification";
import { InfoColor } from "shared/ui-lib/Notification/Notification";
import { useModal } from "View/Modal/ModalProvider";

interface SuccessNotificationProps {
	className?: string;
	isWarn?: boolean;
}

export const SuccessNotification = ({
	className,
	isWarn,
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

	if (isWarn) {
		return (
			<Notification
				isOpen={isOpen}
				className={className}
				setIsOpen={() => hideModal("successNotification")}
				infoIcon
				infoColor={InfoColor.warn}
				cross
			>
				<div className={styles.notificationWr}>
					<h4 className={styles.notificationTitle}>
						{t("miro.notifications.warn")}
					</h4>
					<p className={styles.notificationSuccessDescription}>
						{t("miro.notifications.warnFirstDescription")}
						<a
							href="https://developers.miro.com/docs/miro-rest-api-introduction#what-can-i-do-with-the-rest-api"
							target="_blank"
							rel="noreferrer"
							className={styles.notificationSuccessLink}
						>
							{t("miro.notifications.warnLinkDescription")}
						</a>
						<br />
						<br />
						{t("miro.notifications.warnSecondDescription")}
					</p>
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
	}

	return (
		<Notification
			isOpen={isModalOpen("successNotification")}
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
