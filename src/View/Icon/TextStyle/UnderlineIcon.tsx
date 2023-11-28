import * as React from "react";

export function UnderlineIcon({
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
					d="M 20,8 C 20,58 30.5,70.5 50.5,70.5 70.5,70.5 80,58 80,8"
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
					d="M 10,90 H 90"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
