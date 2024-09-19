import React from "react";

type Props = {
	width?: number;
	height?: number;
	color: string;
};

export function TextColorIndicator({
	color,
	width = 24,
	height = 24,
}: Props): React.ReactElement {
	return (
		<svg
			style={{ width: `${width}px`, height: `${height}px` }}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			id="TextColorIndicator"
		>
			<path
				d="M12 20V4M12 20H9.5M12 20H14.5M12 4H5V6.83426M12 4H19V6.83426"
				stroke="currentColor"
				strokeOpacity="0.8"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				width={14}
				height={16}
			></path>
			{color !== "none" ? (
				<>
					<rect
						x="13"
						y="13"
						width="10"
						height="10"
						rx="5"
						fill="white"
					></rect>
					<circle
						cx="18"
						cy="18"
						r="5"
						fill={color}
						fillOpacity="0.8"
						stroke={
							color === "#FFFFFF" ||
							color === "rgb(255, 255, 255)"
								? "#D3D5D7"
								: "rgb(255, 255, 255)"
						}
					></circle>
				</>
			) : (
				""
			)}
		</svg>
	);
}
