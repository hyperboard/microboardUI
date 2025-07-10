import React from "react";
import styles from "./OuterLink.module.css";
import clsx from "clsx";

interface Props
	extends React.PropsWithChildren<
		React.AnchorHTMLAttributes<HTMLAnchorElement>
	> {}

export const OuterLink: React.FC<Props> = ({ children, className, ...props }) => {
	return (
		<a {...props} className={clsx(styles.link, className)}>
			{children}
		</a>
	);
};
