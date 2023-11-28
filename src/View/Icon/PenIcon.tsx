import * as React from "react";

export function PenIcon({
	color,
	width,
	height,
}: {
	color: string;
	width: number;
	height: number;
}): React.ReactElement {
	const scale = width / 100;

	return (
		<svg
			width={`${width}.0px`}
			height={`${height}.0px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			<path
				style={{
					fill: color,
					stroke: "currentColor",
					strokeWidth: 4,
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="M 6,94 35,80 21,66 Z"
				transform={`scale(${scale})`}
			/>
			<path
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 4,
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="M 35,80 94,22 80,9 22,66"
				transform={`scale(${scale})`}
			/>
			<path
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 4,
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="M 80,35 66,22"
				transform={`scale(${scale})`}
			/>
		</svg>
	);
}
