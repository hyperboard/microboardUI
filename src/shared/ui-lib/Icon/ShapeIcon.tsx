import type { ShapeType } from "Board/Items/Shape";
import React from "react";
import sprite from "./sprite.svg";

type Props = {
	iconName: ShapeType;
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
};

export function ShapeIcon({
	iconName,
	style,
	height = 30,
	width = 30,
}: Props): React.ReactElement {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width={width}
			height={height}
			style={style}
		>
			<use
				width={width}
				height={height}
				xlinkHref={`${sprite}#${iconName}`}
			/>
		</svg>
	);
}
