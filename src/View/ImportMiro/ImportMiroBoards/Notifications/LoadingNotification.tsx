import { Notification } from "shared/ui-lib/Notification";
import { useTranslation } from "react-i18next";
import styles from "../ImportMiroBoards.module.css";
import React from "react";
import { Loader } from "shared/ui-lib/Loader/Loader";
import { useModal } from "View/Modal/ModalProvider";

interface LoadingNotificationProps {
	className?: string;
}

export const LoadingNotification = ({
	className,
}: LoadingNotificationProps): JSX.Element => {
	const { isModalOpen, data, hideModal } = useModal();
	const { t } = useTranslation();

	return (
		<Notification
			isOpen={isModalOpen("loadingNotification")}
			className={className}
			setIsOpen={() => hideModal("loadingNotification")}
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
