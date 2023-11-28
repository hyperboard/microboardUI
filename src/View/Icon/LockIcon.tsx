import * as React from "react";

export function LockIcon({
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
					d="M 5,65 C 6.6321463,56.358497 11.967122,51.694423 20.066725,50 H 80.155842 C 87.590803,51.759154 93.248624,55.834212 95,65 V 80 C 93.321085,88.188671 88.48042,93.341653 80,95 H 20 C 11.470208,93.343135 6.6834395,88.141179 5,80 Z"
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
					d="M 24.409693,49.5 C 24.524868,30.988076 30,5 50,4.9952416 70,5 75.046114,34.26883 74.948926,49.5"
					transform={`translate(1,1) scale(${scale})`}
				/>
				<circle
					style={{
						fill: "#1a1a1a",
						stroke: "#000000",
						strokeWidth: 1,
						strokeDasharray: "none",
					}}
					cx="50"
					cy="75"
					r="5"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
