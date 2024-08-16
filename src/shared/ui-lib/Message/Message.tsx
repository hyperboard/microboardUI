import React, { ReactNode } from "react";
import styles from "./Message.module.css";
import clsx from "clsx";

export enum MessagePosition {
	BOTTOM = "bottom",
	TOP = "top",
}

interface MessageProps {
	className?: string;
	position?: MessagePosition;
	children: ReactNode;
	isOpen: boolean;
}

export const Message = (props: MessageProps) => {
	const {
		className,
		position = MessagePosition.BOTTOM,
		children,
		isOpen,
	} = props;

	return (
		<div
			className={clsx(
				styles.message,
				styles[position],
				isOpen && styles.open,
				className,
			)}
		>
			{children}
		</div>
	);
};
