import React from "react";

export function CircleColorIndicator({
	color,
	width = 24,
	height = 24,
}: {
	color: string;
	width?: number;
	height?: number;
}): React.ReactElement {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			{color === "none" ? (
				<>
					<rect
						width="24"
						height="24"
						rx="12"
						fill="url(#pattern0_5713_2732)"
						fillOpacity="0.05"
					/>
					<rect
						x="0.5"
						y="0.5"
						width="23"
						height="23"
						rx="11.5"
						stroke="black"
						strokeOpacity="0.07"
					/>
					<defs>
						<pattern
							id="pattern0_5713_2732"
							patternContentUnits="objectBoundingBox"
							width="1"
							height="1"
						>
							<use
								xlinkHref="#image0_5713_2732"
								transform="scale(0.015625)"
							/>
						</pattern>
						<image
							id="image0_5713_2732"
							width="64"
							height="64"
							xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAA40lEQVR4Xu3bQQ6EQAhEUbj/oXsO8Sdh4XOvJAi/qkF3Zt6E6710++xuiD6T40uACtACqYlzD2IACFKBkoHcgmSQDJJBMngKIT6ADygF6DSYfcCLTzg/z0eGrASogDbT0gKxB2MB5pkiBoBgrEEMwIBjLx9fAAiCIAhygmkkRgYjhWMHditsL2AvYC+QIHjdwzk+BmAABmBAWc1kCF0bKRAEQRAEQRAMGaACbaCUz/P5BRiKxhQaiV07uRjfYgQDMKDpGAhGCMUCzD4CBEEw1iAGYIBPZMJh+g8/P8cKpAJfV4EfMee/sLtaEFIAAAAASUVORK5CYII="
						/>
					</defs>
				</>
			) : (
				<>
					<rect width="24" height="24" rx="12" fill={color} />
					<rect
						x="0.5"
						y="0.5"
						width="23"
						height="23"
						rx="11.5"
						stroke="black"
						strokeOpacity="0.07"
					/>
				</>
			)}
		</svg>
	);
}
