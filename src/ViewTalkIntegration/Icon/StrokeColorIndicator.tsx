import React from "react";

type Props = {
	color: string;
	width?: number;
	height?: number;
};

export function StrokeColorIndicator({
	color,
	width = 24,
	height = 24,
}: Props) {
	console.log(color);
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			id="BoldCircle"
		>
			<rect
				x="2"
				y="2"
				width="20"
				height="20"
				rx="10"
				stroke={color}
				strokeWidth="4"
			/>
			{(color === "rgb(0, 0, 0)" || color === "#FFFFFF") && (
				<>
					<rect
						x="4"
						y="4"
						width="16"
						height="16"
						rx="8"
						stroke={"#D3D5D7"}
						strokeWidth="1"
					/>
					<rect
						x="0"
						y="0"
						width="24"
						height="24"
						rx="12"
						stroke={"#D3D5D7"}
						strokeWidth="1"
					/>
				</>
			)}
		</svg>
	);
}
