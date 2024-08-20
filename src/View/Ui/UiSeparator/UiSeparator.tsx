import clsx from "clsx";
import React from "react";
import style from "./UiSeparator.module.css";

type Props = {
	vertical?: boolean;
	className?: string;
};

export function UiSeparator({ vertical = false, className }: Props) {
	return (
		<div
			className={clsx(
				style.container,
				vertical ? style.vertical : style.horizontal,
				className,
			)}
		>
			<div
				className={clsx([
					style.separator,
					vertical ? style.vertical : style.horizontal,
				])}
			/>
		</div>
	);
}
