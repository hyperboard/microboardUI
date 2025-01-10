import React, { ReactNode } from "react";
import styles from "./Notification.module.css";
import clsx from "clsx";
import { Icon } from "View/Icon";
import { createPortal } from "react-dom";

export enum InfoColor {
	error = "#E6483D",
	success = "#26BD6C",
	warn = "#F48E2F",
	info = "#4778F5",
}

interface NotificationProps {
	className?: string;
	children: ReactNode;
	isOpen: boolean;
	cross?: boolean;
	setIsOpen: (isOpen: unknown) => void;
	infoIcon?: boolean;
	infoColor?: InfoColor;
	position?: "top" | "bottom";
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
		position = "top",
		...rest
	} = props;

	return isOpen
		? createPortal(
				<div
					className={clsx(
						styles.notification,
						{ [styles.open]: isOpen, [styles.withCross]: cross },
						styles[position],
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
						<div onClick={setIsOpen}>
							<Icon
								iconName={"modalCross"}
								className={styles.cross}
								width={11}
								height={11}
							/>
						</div>
					)}
					{children}
				</div>,
				window.document.body,
			)
		: null;
};
