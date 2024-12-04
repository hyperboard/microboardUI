import clsx from "clsx";
import React, { type HTMLProps } from "react";
import styles from "./UiSkeleton.module.css";

export function UiSkeleton({ className, ...props }: HTMLProps<HTMLDivElement>) {
	return <div className={clsx(styles.skeleton, className)} {...props} />;
}
