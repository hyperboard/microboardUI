import * as React from "react";

export const RedoIcon = ({ isOn, width, height }) => {
	const scale = (width - 2) / 100;
	const color = isOn ? "currentColor" : "rgba(0,0,0,0.2)";
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
						strokeWidth: "4",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="M 50,95 C -68,52 82,-37 84,48"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<path
					style={{
						fill: color,
						stroke: color,
						strokeWidth: "1px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeOpacity: "1",
					}}
					d="M 70,36 88,57 94,30 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
};
