import * as React from "react";

export const UndoIcon = ({ isOn, width, height }) => {
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
					d="M 48,95 C 166,50 14,-36 13,50"
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
					d="M 28,36 10,58 4,30 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
};
