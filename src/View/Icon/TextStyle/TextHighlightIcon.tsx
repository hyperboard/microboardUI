import * as React from "react";

export function TextHighlightIcon({
	color,
	width,
	height,
}: {
	color: string;
	width: number;
	height: number;
}): React.ReactElement {
	const scale = (width - 2) / 100;
	const isTransparent =
		color === "none" || color === "rgba(0,0,0,0)" || color === "";
	return (
		<svg
			width={`${width}.0px`}
			height={`${height}.0px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			{isTransparent && (
				<path
					id="TextHighlightPenTip"
					style={{
						fill: "#ccc",
						stroke: "none",
					}}
					d="m 10,70 c 10,0 20,0 30,0 L 20,46"
					transform={`translate(1,1) scale(${scale})`}
				/>
			)}
			{!isTransparent && (
				<path
					id="TextHighlightPenTip"
					style={{
						fill: color,
						stroke: "none",
					}}
					d="m 10,70 c 10,0 20,0 30,0 L 20,46"
					transform={`translate(1,1) scale(${scale})`}
				/>
			)}
			{isTransparent && (
				<g
					id="TextHighlightHighlight"
					transform={`translate(1,1) scale(${scale})`}
				>
					<path
						style={{
							fill: "#cccccc",
							stroke: "none",
							strokeWidth: "1px",
							strokeLinecap: "butt",
							strokeLinejoin: "miter",
							strokeOpacity: "1",
						}}
						d="M 10,80 H 25 V 95 H 10 Z"
					/>
					<path
						style={{
							fill: "#999999",
							stroke: "none",
							strokeWidth: "1px",
							strokeLinecap: "butt",
							strokeLinejoin: "miter",
							strokeOpacity: "1",
						}}
						d="M 25,80 H 40 V 95 H 25 Z"
					/>
					<path
						style={{
							fill: "#cccccc",
							stroke: "none",
							strokeWidth: "1px",
							strokeLinecap: "butt",
							strokeLinejoin: "miter",
							strokeOpacity: "1",
						}}
						d="m 40,80 h 15 v 15 h -15 z"
					/>
					<path
						style={{
							fill: "#cccccc",
							stroke: "none",
							strokeWidth: "1px",
							strokeLinecap: "butt",
							strokeLinejoin: "miter",
							strokeOpacity: "1",
						}}
						d="m 70,80 h 15 v 15 h -15 z"
					/>
					<path
						style={{
							fill: "#999999",
							stroke: "none",
							strokeWidth: "1px",
							strokeLinecap: "butt",
							strokeLinejoin: "miter",
							strokeOpacity: "1",
						}}
						d="m 55,80 h 15 v 15 h -15 z"
					/>
				</g>
			)}
			{!isTransparent && (
				<path
					id="TextHighlightHighlight"
					style={{
						fill: color,
						stroke: "none",
					}}
					d="M 10,80 H 90 V 95 H 10 Z"
					transform={`translate(1,1) scale(${scale})`}
				/>
			)}
			<path
				id="TextHighlightEraser"
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "4px",
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="m 76.8,39 -20,-23"
				transform={`translate(1,1) scale(${scale})`}
			/>
			<path
				id="TextHighlightBenBack"
				style={{
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "4px",
					strokeLinecap: "butt",
					strokeLinejoin: "miter",
					strokeOpacity: 1,
				}}
				d="m 40,70 50,-43 c 0,-14 -5,-22 -20,-22 l -50,42 z"
				transform={`translate(1,1) scale(${scale})`}
			/>
		</svg>
	);
}
