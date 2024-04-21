import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import style from "./FontSizePicker.module.css";

type Props = {
	onPick: (size: number) => void;
	max?: number;
	fontSizes: number[];
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
}: Props): React.ReactElement {
	return (
		<>
			{fontSizes.map(size => (
				<UiButton
					key={size}
					onClick={() => onPick(size)}
					className={style.button}
					disabled={Boolean(max && size > max)}
				>
					{size}
				</UiButton>
			))}
		</>
	);
}
