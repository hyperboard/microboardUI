import * as React from "react";

export function ItalicsIcon({
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
					d="M 30,8 H 80 M 55,10 45,90 M 20,90 H 70"
					transform={`translate(1,1) scale(${scale})`}
				/>
			</g>
		</svg>
	);
}
