import * as React from "react";

export function SidePanelOpenIcon({
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
			<g
				transform={`translate(1,1) scale(${scale})`}
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: strokeWidth,
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: "1",
				}}
			>
				<path d="m 12,34 24,0" />
				<path d="m 12,50 24,0" />
				<path d="m 12,66 24,0" />
				<path d="M 5,5 H 95 V 95 H 5 Z" />
				<path d="M 44,5 V 95" />
				<path d="M 55,25 80,50 55,75" />
			</g>
		</svg>
	);
}
