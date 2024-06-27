import React from "react";
import { Icon } from "../Icon";
import style from "./TextColorIndicator.module.css";

type Props = {
	color?: string;
};

export function TextColorIndicator({ color }: Props): React.ReactElement {
	return (
		<div className={style.icon}>
			<Icon iconName="TextColor" />
			{color && color !== "none" && (
				<span
					className={style.indicator}
					style={{ backgroundColor: color }}
				/>
			)}
		</div>
	);
}
