import React from "react";
import styles from "./UIMainLoader.module.css";

export const UIMainLoader = (): JSX.Element => {
	return (
		<div className={styles.icon}>
			<img src="/loader.svg" alt="Loading..." />
		</div>
	);
};
