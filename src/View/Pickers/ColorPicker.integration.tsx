import * as React from "react";
import { ColorCircle } from "View/Icon/Integration/ColorCircle";

export function ColorPicker({
	onPick,
	selectedColor,
	allowNone = false,
	colors,
	isNoneLast = false,
}: {
	onPick: (color: string) => void;
	selectedColor: string;
	allowNone?: boolean;
	colors: string[];
	isNoneLast?: boolean
}): React.ReactElement {
	return (
		<>
			{allowNone && !isNoneLast && (
				<button
					key={"none"}
					style={{
						width: 30,
						height: 30,
						cursor: "pointer",
						border: "none",
						background: "none",
						padding: 0,
						margin: 0,
					}}
					onClick={() => onPick("none")}
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
					style={{
						width: 30,
						height: 30,
						display: "block",
						cursor: "pointer",
						border: "none",
						background: "none",
						padding: 0,
						margin: 0,
					}}
					onClick={() => onPick(color)}
				>
					<ColorCircle
						color={color}
						selected={color === selectedColor}
					/>
				</button>
			))}
			{allowNone && isNoneLast && (
				<button
					key={"none"}
					style={{
						width: 30,
						height: 30,
						cursor: "pointer",
						border: "none",
						background: "none",
						padding: 0,
						margin: 0,
					}}
					onClick={() => onPick("none")}
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
