import * as React from "react";

export function SwitchPointersIcon({
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
					d="M 13.543235,43.009345 C 19.849881,25.60516 52.483186,17.378382 73.737386,33.13418"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 77.454595,25.535033 88.130503,40 70.035959,39.742535 Z"
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
					d="m 28.453422,67.461454 c 22.895145,16.128226 56.995154,4.484341 60.820051,-9.32318"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "currentColor",
						stroke: "currentColor",
						strokeWidth: strokeWidth,
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 32.487891,60.969309 14.496046,59.027063 23.777789,74.423802 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
