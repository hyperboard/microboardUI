import React from "react";
import clsx from "clsx";
import styles from "./CommentsPanel.module.css";

interface Props {
	isActive: boolean;
}

export const ToggleMark = ({ isActive }: Props) => {
	return (
		<div className={clsx(styles.toggle, isActive && styles.active)}>
			<span></span>
		</div>
	);
};
