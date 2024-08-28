import { Notification } from "shared/ui-lib/Notification";
import { useTranslation } from "react-i18next";
import styles from "../ImportMiroBoards.module.css";
import React from "react";
import { Loader } from "shared/ui-lib/Loader/Loader";

interface LoadingNotificationProps {
	className?: string;
	loadingNotification: boolean;
	loadingPercentage: number;
}

export const LoadingNotification = ({
	className,
	loadingNotification,
	loadingPercentage,
}: LoadingNotificationProps): JSX.Element => {
	const { t } = useTranslation();

	return (
		<Notification isOpen={loadingNotification} className={className}>
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
					{t("miro.loadingNotification.text")} {loadingPercentage}
					%...
				</p>
			</div>
		</Notification>
	);
};
