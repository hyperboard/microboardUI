import clsx from "clsx";
import styles from "./Loader.module.css";
import React from "react";
import { Icon } from "View/Icon";

interface LoaderProps {
	className?: string;
	width?: number;
	height?: number;
}

export const Loader = ({ className, width = 32, height = 32 }: LoaderProps) => {
	return (
		<Icon
			iconName={"loader"}
			width={width}
			height={height}
			className={clsx(styles.loader, className)}
		/>
	);
};
