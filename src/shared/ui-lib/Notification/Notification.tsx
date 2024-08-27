import React, { ReactNode } from "react";
import styles from "./Notification.module.css";
import clsx from "clsx";

interface NotificationProps {
	className?: string;
	children: ReactNode;
	isOpen: boolean;
	setIsOpen?: (isOpen: boolean) => void;
}

export const Notification: React.FC<NotificationProps> = (
	props: NotificationProps,
) => {
	const { className, children, isOpen, setIsOpen, ...rest } = props;

	return (
		<div
			className={clsx(styles.notification, { [styles.open]: isOpen }, [
				className,
			])}
			{...rest}
		>
			{children}
		</div>
	);
};
