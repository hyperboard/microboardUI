import React from "react";
import sprite from "./sprite.svg";

type IconId =
	| "Dots"
	| "ColoredCircle"
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
  | "Redo";

type Props = {
	iconName: IconId;
	width?: number | string;
	height?: number | string;
};

export function Icon({
	iconName,
	height = 24,
	width = 24,
}: Props): React.ReactElement {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			style={{ width, height }}
		>
			<use
				style={{ width, height }}
				xlinkHref={`../${sprite}#${iconName}`}
			/>
		</svg>
	);
}
