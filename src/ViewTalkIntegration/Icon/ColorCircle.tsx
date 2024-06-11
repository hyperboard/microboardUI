import React from "react";

type Props = {
	selected?: boolean;
	color: string | "none";
	width?: number;
	height?: number;
};

export function ColorCircle({
	color,
	height = 30,
	selected = false,
	width = 30,
}: Props) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 30 30"
			fill="none"
		>
			{selected && (
				<rect
					x="1.5"
					y="1.5"
					width="27"
					height="27"
					rx="13.5"
					stroke={"#1481DD"}
					strokeWidth="3"
				/>
			)}
			<rect
				x="3.5"
				y="3.5"
				width="23"
				height="23"
				rx="11.5"
				stroke={
					color === "#FFFFFF" || color === "rgb(255, 255, 255)"
						? "#D3D5D7"
						: "rgb(237, 237, 237)"
				}
			/>
			{color !== "none" ? (
				<>
					<rect
						x="3.5"
						y="3.5"
						width="23"
						height="23"
						rx="11.5"
						fill={color}
					/>
				</>
			) : (
				<>
					<rect
						x="3"
						y="3"
						width="24"
						height="24"
						rx="12"
						fill="url(#pattern0_5672_38763)"
						fillOpacity="0.05"
					/>
					<rect
						x="3.5"
						y="3.5"
						width="23"
						height="23"
						rx="11.5"
						stroke="white"
					/>
					<defs>
						<pattern
							id="pattern0_5672_38763"
							patternContentUnits="objectBoundingBox"
							width="1"
							height="1"
						>
							<use
								xlinkHref="#image0_5672_38763"
								transform="scale(0.015625)"
							/>
						</pattern>
						<image
							id="image0_5672_38763"
							width="64"
							height="64"
							xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA40lEQVR4Xu3bQQ6EQAhEUbj/oXsO8Sdh4XOvJAi/qkF3Zt6E6710++xuiD6T40uACtACqYlzD2IACFKBkoHcgmSQDJJBMngKIT6ADygF6DSYfcCLTzg/z0eGrASogDbT0gKxB2MB5pkiBoBgrEEMwIBjLx9fAAiCIAhygmkkRgYjhWMHditsL2AvYC+QIHjdwzk+BmAABmBAWc1kCF0bKRAEQRAEQRAMGaACbaCUz/P5BRiKxhQaiV07uRjfYgQDMKDpGAhGCMUCzD4CBEEw1iAGYIBPZMJh+g8/P8cKpAJfV4EfMee/sLtaEFIAAAAASUVORK5CYII="
						/>
					</defs>
				</>
			)}
		</svg>
	);
}
