import * as React from "react";

export function BoldIcon({
	width,
	height,
}: {
	isOn: boolean;
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
						strokeWidth: "8px",
						strokeLinecap: "butt",
						strokeLinejoin: "miter",
						strokeDasharray: "none",
						strokeOpacity: "1",
					}}
					d="M 20,8 V 90 C 60,90 80,86 80,70 80,50 60,45 20,45 60,48 75,42 75,25 75,4 40,8 20,8 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
