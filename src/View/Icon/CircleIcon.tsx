import * as React from "react";

export const CircleIcon = ({ width, height, fill, stroke, strokeWidth }) => {
	const scale = (width - 2) / 100;
	const tileSize = 16;

	const patternStyle = {
		fill: "url(#checkerboard)",
	};

	return (
		<svg
			width={`${width}.0px`}
			height={`${height}.0px`}
			viewBox={`0 0 ${width}.0 ${height}.0`}
		>
			<defs>
				<pattern
					id="checkerboard"
					width={tileSize * 2}
					height={tileSize * 2}
					patternUnits="userSpaceOnUse"
				>
					<rect
						width={tileSize}
						height={tileSize}
						fill="#fff"
						x={0}
						y={0}
					/>
					<rect
						width={tileSize}
						height={tileSize}
						fill="#ccc"
						x={tileSize}
						y={0}
					/>
					<rect
						width={tileSize}
						height={tileSize}
						fill="#ccc"
						x={0}
						y={tileSize}
					/>
					<rect
						width={tileSize}
						height={tileSize}
						fill="#fff"
						x={tileSize}
						y={tileSize}
					/>
				</pattern>
			</defs>
			<circle
				cx={50}
				cy={50}
				r={45}
				fill={fill}
				stroke={stroke}
				strokeWidth={`${strokeWidth ?? 4}px`}
				transform={`translate(1,1) scale(${scale})`}
				style={
					fill === "none" || fill === "rgba(0,0,0,0)" || fill === ""
						? patternStyle
						: {}
				}
			/>
		</svg>
	);
};
