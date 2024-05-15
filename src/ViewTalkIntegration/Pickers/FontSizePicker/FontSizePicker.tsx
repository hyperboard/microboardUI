import clsx from "clsx";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import style from "./FontSizePicker.module.css";

type Props = {
	onPick: (size: number) => void;
	max?: number;
	fontSizes: number[];
	currentFontSize: number;
	id?: string;
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
	currentFontSize,
	id = "",
}: Props): React.ReactElement {
	return (
		<>
			{fontSizes.map(size => (
				<UiButton
					id={id ? `size-${size}` : `${id}-size-${size}`}
					key={size}
					onClick={() => onPick(size)}
					className={clsx(
						style.button,
						size === currentFontSize && style.active,
					)}
					disabled={Boolean(max && size > max)}
				>
					{size}
				</UiButton>
			))}
		</>
	);
}
