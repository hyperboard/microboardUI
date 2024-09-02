import React from "react";
import styles from "./OuterLink.module.css";

interface Props
	extends React.PropsWithChildren<
		React.AnchorHTMLAttributes<HTMLAnchorElement>
	> {}

export const OuterLink: React.FC<Props> = ({ children, ...props }) => {
	return (
		<a {...props} className={styles.link}>
			{children}
		</a>
	);
};
