import React from "react";
import { ColorItem } from "./ColorItem";
import { SquareColorItem } from "./SquareColorItem";

type Props = {
	onPick: (color: string) => void;
	selectedColor?: string;
	colors: string[];
	id?: string;
	variant?: "circle" | "square";
};

export function ColorPicker({
	onPick,
	selectedColor,
	colors,
	id = "",
	variant = "circle",
}: Props): React.ReactElement {
	return (
		<>
			{colors.map(color =>
				variant === "circle" ? (
					<ColorItem
						key={color}
						id={id ? `${id}-color-${color}` : `color-${color}`}
						color={color}
						active={color === selectedColor}
						onPick={onPick}
					/>
				) : (
					<SquareColorItem
						key={color}
						id={id ? `${id}-color-${color}` : `color-${color}`}
						color={color}
						selected={color === selectedColor}
						onPick={onPick}
					/>
				),
			)}
		</>
	);
}
