import React from "react";
import clsx from "clsx";
import styles from "./ToggleMark.module.css";

interface Props {
	isActive: boolean;
}

export const ToggleMark = ({ isActive }: Props): JSX.Element => {
	return (
		<div className={clsx(styles.toggle, isActive && styles.active)}>
			<span></span>
		</div>
	);
};
