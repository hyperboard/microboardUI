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
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
	currentFontSize,
	onAutoSizePick,
}: Props): React.ReactElement {
	const { t } = useTalkTranslation();

	return (
		<>
			{onAutoSizePick && (
				<UiButton
					key={"auto"}
					onClick={onAutoSizePick}
					className={clsx(
						style.button,
						currentFontSize === "auto" && style.active,
					)}
				>
					{t("contextPanel.fontSize.auto")}
				</UiButton>
			)}
			{fontSizes.map(size => (
				<UiButton
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
