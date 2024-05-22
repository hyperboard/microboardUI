import React from "react";
import styles from "./Link.module.css";
import { Link as RRDLink } from "react-router-dom";

interface Props
	extends React.PropsWithChildren<
		React.AnchorHTMLAttributes<HTMLAnchorElement>
	> {
	to: string;
}

export const Link: React.FC<Props> = ({ children, ...props }) => {
	return (
		<RRDLink {...props} className={styles.link}>
			{children}
		</RRDLink>
	);
};
