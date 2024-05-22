import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	pattern?: "primary" | "secondary" | "tertiary" | "ghost";
}

export const Button: React.FC<Props> = ({
	pattern = "primary",
	children,
	className,
	...props
}) => {
	return (
		<button
			className={clsx(styles.button, styles[pattern], className)}
			{...props}
		>
			{children}
		</button>
	);
};
