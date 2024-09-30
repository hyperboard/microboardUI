import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";
import { Loader } from "./Loader";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	pattern?: "primary" | "secondary" | "tertiary" | "ghost" | "quaternary";
	loading?: boolean;
}

export const Button: React.FC<Props> = ({
	pattern = "primary",
	children,
	className,
	...props
}) => {
	return (
		<button
			className={clsx(
				styles.button,
				styles[pattern],
				className,
				props.loading && styles.loading,
			)}
			disabled={props.loading || props.disabled}
			{...props}
		>
			{props.loading && (
				<div className={styles.loader}>
					<Loader />
				</div>
			)}
			{children}
		</button>
	);
};
