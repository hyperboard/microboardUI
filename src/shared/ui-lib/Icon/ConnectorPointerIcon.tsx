import React from "react";
import sprite from "./sprite.svg";

export type ConnectorPointerType =
	| "None"
	| "ArrowBroad"
	| "ArrowThin"
	| "TriangleFilled"
	| "CircleFilled"
	| "Angle"
	| "TriangleEmpty"
	| "DiamondFilled"
	| "DiamondEmpty"
	| "Zero"
	| "One"
	| "Many"
	| "ManyMandatory"
	| "OneMandatory"
	| "ManyOptional"
	| "OneOptional";

type Props = {
	iconName: ConnectorPointerType;
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
};

export function ConnectorPointerIcon({
	iconName,
	style,
	height = 24,
	width = 24,
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
