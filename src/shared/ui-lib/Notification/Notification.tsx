import React, { ReactNode } from "react";
import styles from "./Notification.module.css";
import clsx from "clsx";
import { Icon } from "View/Icon";

export enum InfoColor {
	error = "#E6483D",
	success = "#26BD6C",
}

interface NotificationProps {
	className?: string;
	children: ReactNode;
	isOpen: boolean;
	cross?: boolean;
	setIsOpen?: (isOpen: boolean) => void;
	infoIcon?: boolean;
	infoColor?: InfoColor;
}

export const Notification: React.FC<NotificationProps> = (
	props: NotificationProps,
) => {
	const {
		className,
		children,
		isOpen,
		setIsOpen,
		cross,
		infoIcon,
		infoColor = InfoColor.error,
		...rest
	} = props;

	return (
		<div
			className={clsx(
				styles.notification,
				{ [styles.open]: isOpen, [styles.withCross]: cross },
				[className],
			)}
			{...rest}
		>
			{infoIcon && (
				<Icon
					iconName={"Notification"}
					className={styles.notificationIcon}
					width={20}
					height={20}
					style={{ color: infoColor }}
				/>
			)}
			{cross && (
				<div onClick={() => setIsOpen?.(false)}>
					<Icon
						iconName={"modalCross"}
						className={styles.cross}
						width={11}
						height={11}
					/>
				</div>
			)}
			{children}
		</div>
	);
};
