import clsx from "clsx";
import React from "react";
import styles from "./SquareColorItem.module.css";

type Props = {
	color: string;
	selected: boolean;
	onPick: (color: string) => void;
	id?: string;
};

export function SquareColorItem({ color, selected, onPick, id }: Props): React.ReactElement {
	return (
		<button
			onClick={() => onPick(color)}
			id={id}
			className={clsx(selected && styles.active, styles.button)}
		>
			<span style={{ backgroundColor: color }} />
		</button>
	);
}
