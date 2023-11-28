import * as React from "react";

export function StrikethroughIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const color = "currentColor";

	return (
		<svg
			width={`${width}.0px`}
			height={`${height}.0px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			<g>
				<path
					style={{
						fill: "none",
						stroke: color,
						strokeWidth: "4px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="M 75,30 C 75,7.5 61.5,8 50,8 37.5,8 24,12 25,30 25,40 75,46 75,65 75,83.5 64,90 50,90 36.5,90.5 26,85 26,65"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: color,
						strokeWidth: "4px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="M 10,50 H 90"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
