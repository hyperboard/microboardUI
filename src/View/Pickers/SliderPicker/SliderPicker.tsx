import { UiSlider } from "View/Ui/UiSlider";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./SliderPicker.module.css";

type Props = {
	min: number;
	max: number;
	initialValue?: number;
	step: number;
	onPick: (val: number) => void;
	showLabel?: boolean;
	// width?: number;
	id?: string;
};

export function SliderPicker({
	onPick,
	min,
	max,
	initialValue,
	showLabel,
	// width,
	id,
	step,
}: Props) {
	const { t } = useTranslation();
	return (
		<div className={style.container}>
			<UiSlider
				min={min}
				max={max}
				step={step}
				initialValue={initialValue}
				id={id}
				onChange={onPick}
			/>
			{showLabel && (
				<label className={style.label}>
					{t("toolsPanel.addDrawing.strokeWidth")}
				</label>
			)}
		</div>
	);
}
