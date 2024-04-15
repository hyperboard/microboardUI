import React from "react";

type Props = {
	width?: number;
	height?: number;
};

export function UndoIcon({
	width = 24,
	height = 24,
}: Props): React.ReactElement {
	return (
		<svg
			width={width}
			height={height}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 17 17"
			id="Undo"
		>
			<path
				d="M4 1L1 4M1 4L4 7M1 4H10C13.314 4 16.0261 6.96486 16.0261 10.0029C16.0261 13.0409 13.314 16 10 16H2"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			></path>
		</svg>
	);
}
