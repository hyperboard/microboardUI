import React from "react";
import { Icon } from "../Icon";
import style from "./TextHighlightIndicator.module.css";

type Props = {
	color?: string;
};

export function TextHighlightIndicator({ color }: Props): React.ReactElement {
	return (
		<div className={style.icon}>
			<Icon iconName="TextHighlight" />
			{color && color !== "none" && (
				<span
					className={style.indicator}
					style={{ backgroundColor: color }}
				/>
			)}
		</div>
	);
}
