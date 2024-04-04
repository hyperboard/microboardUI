import React from "react";
import sprite from "./sprite.svg";

export type IconId =
	| "Dots"
	| "TextAlignRight"
	| "TextAlignCenter"
	| "TextAlignLeft"
	| "TextUnderline"
	| "TextStrike"
	| "TextItalic"
	| "TextFormat"
	| "UpDownArrow"
	| "TextBold"
	| "Pointer"
	| "Sticker"
	| "AddText"
	| "AddShape"
	| "Arrow"
	| "Pen"
	| "Image"
	| "Undo"
	| "Redo"
	| "Rectangle"
	| "RoundedRectangle"
	| "Circle"
	| "Hexagon"
	| "Rhombus"
	| "Triangle"
	| "Star" 
	| "ArrowRight"
	| "ArrowLeft"
	| "ArrowBlockRight"
	| "ArrowBlockLeft"
	| "SpeachBubble"
	| "ReversedParallelogram"
	| "Parallelogram"
	| "ReversedTriangle";

type Props = {
	iconName: IconId;
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
};

export function Icon({
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
				xlinkHref={`../${sprite}#${iconName}`}
			/>
		</svg>
	);
}
