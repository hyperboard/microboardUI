import React from "react";
import {
	InfoColor,
	Notification,
} from "shared/ui-lib/Notification/Notification";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import styles from "./Notifications.module.css";
import { useTranslation } from "react-i18next";

export const ERROR_SIGNUP_NOTIFY = Symbol("errorSignup");

export const SignupErrorNotification = (): JSX.Element => {
	const { isModalOpen, closeModal } = useUiModalContext();
	const { t } = useTranslation();

	return (
		<Notification
			isOpen={isModalOpen(ERROR_SIGNUP_NOTIFY)}
			setIsOpen={closeModal}
			infoColor={InfoColor.error}
			cross
		>
			<div className={styles.notificationWr}>
				<h3 className={styles.notificationTitle}>
					{t("auth.signupNotifyError.title")}
				</h3>
				<p className={styles.notificationText}>
					{t("auth.signupNotifyError.text")}
				</p>
			</div>
		</Notification>
	);
};
