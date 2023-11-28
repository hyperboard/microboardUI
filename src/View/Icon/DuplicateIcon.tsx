import * as React from "react";

export function DuplicateIcon({
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
					d="M 20,75 H 5 V 5 h 70 v 15"
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
					d="m 25.5,25 h 70 v 70 h -70 z"
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
					d="m 30.5,60 h 60"
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
					d="M 60.5,90 V 30"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
