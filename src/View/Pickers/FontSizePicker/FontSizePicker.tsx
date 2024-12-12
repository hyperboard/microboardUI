import { UiButton } from "View/Ui/UiButton/UiButton";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSizePicker.module.css";

type Props = {
	onPick: (size: number | "auto") => void;
	max?: number;
	fontSizes: number[];
	currentFontSize: number | "auto";
	showAuto: boolean;
	id?: string;
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
	currentFontSize,
	showAuto,
	id = "",
}: Props): React.ReactElement {
	const { t } = useTranslation();

	return (
		<>
			{showAuto && (
				<UiButton
					onClick={() => onPick("auto")}
					className={clsx(
						style.button,
						currentFontSize === "auto" && style.active,
					)}
					variant="secondary"
					rounded={"none"}
					active={currentFontSize === "auto"}
				>
					{t("contextPanel.fontSize.auto")}
				</UiButton>
			)}
			{fontSizes.map((size) => (
				<UiButton
					id={id ? `${id}${size}` : ""}
					key={`fontSize_${size}_button`}
					onClick={() => onPick(size)}
					className={clsx(
						style.button,
						size === currentFontSize && style.active,
					)}
					disabled={Boolean(max && size > max)}
					variant="secondary"
					rounded={"none"}
					active={size === currentFontSize}
				>
					{size}
				</UiButton>
			))}
		</>
	);
}
