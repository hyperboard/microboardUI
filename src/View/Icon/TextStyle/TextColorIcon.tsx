import * as React from "react";

export function TextColorIcon({
	color,
	width,
	height,
}: {
	color: string;
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	return (
		<svg
			width={`${width}.0px`}
			height={`${height}.0px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			<path
				id="TextColorBar"
				style={{
					fill: color,
					stroke: "none",
				}}
				d="M 10,81 H 90 v 15 H 10 Z"
				transform={`translate(1,1) scale(${scale})`}
			/>
			<path
				id="TextColorA"
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "4px",
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="M 20,70 50,10 80,70"
				transform={`translate(1,1) scale(${scale})`}
			/>
			<path
				id="TextColorA"
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "4px",
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="m 33,45 34,0"
				transform={`translate(1,1) scale(${scale})`}
			/>
		</svg>
	);
}
