import clsx from "clsx";
import styles from "./Loader.module.css";
import React from "react";
import { Icon } from "shared/ui-lib/Icon";

interface LoaderProps {
	className?: string;
	width?: number;
	height?: number;
}

export const Loader: React.FC<LoaderProps> = ({
	className,
	width = 32,
	height = 32,
}: LoaderProps) => {
	return (
		<Icon
			iconName={"loader"}
			width={width}
			height={height}
			className={clsx(styles.loader, className)}
		/>
	);
};
