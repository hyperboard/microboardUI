import React from "react";
import { ColorCircle } from "ViewTalkIntegration/Icon";
import style from "./ColorPicker.module.css";

type Props = {
	onPick: (color: string) => void;
	selectedColor?: string;
	allowNone?: boolean;
	colors: string[];
	isNotLast?: boolean;
};

export function ColorPicker({
	onPick,
	selectedColor,
	allowNone = false,
	colors,
	isNotLast = false,
}: Props): React.ReactElement {
	const handleClearPick = () => onPick("none");

	return (
		<>
			{allowNone && !isNotLast && (
				<button
					key={"none"}
					className={style.button}
					onClick={handleClearPick}
				>
					<ColorCircle
						color={"none"}
						selected={selectedColor === "none"}
					/>
				</button>
			)}
			{colors.map(color => (
				<button
					key={color}
					className={style.button}
					onClick={() => onPick(color)}
				>
					<ColorCircle
						color={color}
						selected={color === selectedColor}
					/>
				</button>
			))}
			{allowNone && isNotLast && (
				<button
					key={"none"}
					className={style.button}
					onClick={handleClearPick}
				>
					<ColorCircle
						color={"none"}
						selected={selectedColor === "none"}
					/>
				</button>
			)}
		</>
	);
}
