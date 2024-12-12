import React from "react";

import clsx from "clsx";
import style from "./ColorItem.module.css";

type Props = {
	color: string;
	active?: boolean;
	id?: string;
	onPick: (color: string) => void;
};

export function ColorItem({ color, active, onPick, id }: Props): React.ReactElement {
	return (
		<button
			onClick={() => onPick(color)}
			id={id}
			style={{
				backgroundColor: color === "none" ? "transparent" : color,
			}}
			className={clsx(
				style.button,
				active && style.active,
				color === "none" && style.none,
			)}
		/>
	);
}
