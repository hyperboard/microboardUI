import { Notification } from "shared/ui-lib/Notification";
import { useTranslation } from "react-i18next";
import styles from "../ImportMiro.module.css";
import React, { useEffect } from "react";
import { Loader } from "shared/ui-lib/Loader/Loader";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const LOADING_NOTIFICATION = Symbol("loadingNotification");

interface LoadingNotificationProps {
	className?: string;
}

export const LoadingNotification = ({
	className,
}: LoadingNotificationProps): JSX.Element => {
	const { isModalOpen, data, closeModal } = useUiModalContext();
	const { t } = useTranslation();
	const { isLoggedIn } = useAccount();

	useEffect(() => {
		if (isModalOpen(LOADING_NOTIFICATION) && !isLoggedIn) {
			closeModal();
		}
	}, [isLoggedIn]);

	return (
		<Notification
			isOpen={isModalOpen(LOADING_NOTIFICATION)}
			className={className}
			setIsOpen={closeModal}
			cross
		>
			<Loader
				className={styles.notificationIcon}
				width={20}
				height={20}
			/>
			<div className={styles.notificationLoaderWr}>
				<h4 className={styles.notificationTitle}>
					{t("miro.loadingNotification.title")}
				</h4>
				<p className={styles.notificationLoaderText}>
					{t("miro.loadingNotification.text")} {data}
					%...
				</p>
			</div>
		</Notification>
	);
};
