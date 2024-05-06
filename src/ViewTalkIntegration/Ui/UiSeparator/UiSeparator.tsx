import clsx from "clsx";
import React from "react";
import style from "./UiSeparator.module.css";

type Props = {
	vertical?: boolean;
};

export function UiSeparator({ vertical = false }: Props) {
	return (
		<div
			className={clsx([
				style.separator,
				vertical ? style.vertical : style.horizontal,
			])}
		/>
	);
}
