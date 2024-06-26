import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./FontSizePicker.module.css";

type Props = {
	onPick: (size: number) => void;
	max?: number;
	fontSizes: number[];
	currentFontSize: number | "auto";
	onAutoSizePick?: () => void;
	id?: string;
};

export function FontSizePicker({
	onPick,
	max,
	fontSizes,
	currentFontSize,
	onAutoSizePick,
	id = "",
}: Props): React.ReactElement {
	const { t } = useTranslation();

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
			{fontSizes.map((size, i) => (
				<UiButton
					id={id ? `size-${size}` : `${id}-size-${size}`}
					key={size}
					onClick={() => onPick(size)}
					className={clsx(
						style.button,
						size === currentFontSize && style.active,
					)}
					disabled={Boolean(max && size > max)}
					variant="secondary"
					rounded={
						i === 0
							? "top"
							: i === fontSizes.length - 1
							? "bottom"
							: "none"
					}
					active={size === currentFontSize}
				>
					{size}
				</UiButton>
			))}
		</>
	);
}
