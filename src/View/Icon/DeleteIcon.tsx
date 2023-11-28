import * as React from "react";

export function DeleteIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const strokeWidth = "4px";
	return (
		<svg width={width} height={height} viewBox={`0 0 ${height} ${height}`}>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="m 9.8458082,22.50404 c 25.9999998,-2.5 52.8592048,-2.727954 79.8592048,-0.227954 M 82.614469,29.238697 80,90 C 64,93 35,93 20,90 L 16.851199,29.120063"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 37.299198,29.546314 40,80"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 63.115649,29.830067 60,80"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 34.844528,22.021559 C 35,5 65,5 65.140679,22.795698"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
