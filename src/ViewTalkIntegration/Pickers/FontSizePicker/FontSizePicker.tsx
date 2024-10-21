import clsx from "clsx";
import React from "react";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./FontSizePicker.module.css";

type Props = {
	onPick: (size: number) => void;
	max?: number;
	fontSizes: number[];
	currentFontSize: number | "auto";
	onAutoSizePick?: () => void;
	isAutoSize?: boolean;
	id?: string;
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
	currentFontSize,
	onAutoSizePick,
	isAutoSize,
	id = "",
}: Props): React.ReactElement {
	const { t } = useTalkTranslation();
	return (
		<>
			{onAutoSizePick && (
				<UiButton
					key={"auto"}
					onClick={onAutoSizePick}
					className={clsx(style.button, isAutoSize && style.active)}
				>
					{t("contextPanel.fontSize.auto")}
				</UiButton>
			)}
			{fontSizes.map(size => (
				<UiButton
					id={id ? `size-${size}` : `${id}-size-${size}`}
					key={size}
					onClick={() => onPick(size)}
					className={clsx(
						style.button,
						size === currentFontSize && style.active,
					)}
					// disabled={typeof max === "number" && size >= max}
				>
					{size}
				</UiButton>
			))}
		</>
	);
}
