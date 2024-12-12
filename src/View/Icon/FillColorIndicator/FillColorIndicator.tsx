import clsx from "clsx";
import React from "react";
import style from "./FillColorIndicator.module.css";

type Props = {
	color: string;
	width?: number;
	height?: number;
};

export function FillColorIndicator({
	color,
	height = 20,
	width = 20,
}: Props): React.ReactElement {
	return (
		<div
			style={{
				height,
				width,
				backgroundColor: color,
			}}
			className={clsx(style.indicator, color === "none" && style.none)}
		/>
	);
}
