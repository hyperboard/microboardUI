import * as React from "react";

export function BoldUnderlineIcon({
	width,
	height,
}: {
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;

	return (
		<svg
			width={`${width}px`}
			height={`${height}px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			<g>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "8px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="m 20.5,11 -0,57.5 c 42,0 53,1 53,-12.5 C 73.5,40 62,38 20,40 62,40 67,34 67,21 67,9 40,11 20.5,11 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "8px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="M 10,90 H 90"
					transform={`translate(1,2) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
