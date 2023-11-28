import * as React from "react";
import { Icons } from "./Icons";

interface Props {
	name: keyof typeof Icons;
	width: number;
	height: number;
	className?: string;
	fill?: string;
	stroke?: string;
	style?: React.CSSProperties;
}

export function Icon(props: Props): React.ReactElement {
	const icon = Icons[props.name];
	const pathElements = [];
	const scale = (props.width - 2) / icon.width;
	const strokeWidth = (icon.width / props.width) * 1.2;
	for (const path of icon.paths) {
		pathElements.push(
			<path
				key={path}
				d={path}
				transform={`translate(1,1) scale(${scale})`}
			/>,
		);
	}
	return (
		<svg
			width={`${props.width}.0px`}
			height={`${props.height}.0px`}
			viewBox={`0 0 ${props.width}.0 ${props.height}.0`}
			style={{
				...props.style,
				fill: props.fill ?? "none",
				stroke: props.stroke ?? "currentColor",
				strokeWidth,
			}}
			className={props.className ?? ""}
		>
			<g>{pathElements}</g>
		</svg>
	);
}
