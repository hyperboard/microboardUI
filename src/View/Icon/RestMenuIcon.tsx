import * as React from "react";

export function DeleteIcon({
	width,
	height,
  fill,
}: {
	width: number;
	height: number;
  fill: string;
}): React.ReactElement {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 20 4"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M4 2C4 3.10457 3.10457 4 2 4C0.89543 4 0 3.10457 0 2C0 0.89543 0.89543 0 2 0C3.10457 0 4 0.89543 4 2Z"
				fill={fill}
			/>
			<path
				d="M12 2C12 3.10457 11.1046 4 10 4C8.89543 4 8 3.10457 8 2C8 0.89543 8.89543 0 10 0C11.1046 0 12 0.89543 12 2Z"
				fill={fill}
			/>
			<path
				d="M20 2C20 3.10457 19.1046 4 18 4C16.8954 4 16 3.10457 16 2C16 0.89543 16.8954 0 18 0C19.1046 0 20 0.89543 20 2Z"
				fill={fill}
			/>
		</svg>
	);
}
