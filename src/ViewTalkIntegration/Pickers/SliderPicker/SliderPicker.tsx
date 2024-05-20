import React from "react";
import { UiSegmentedSlider } from "ViewTalkIntegration/Ui/UiSegmentedSlider";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./SliderPicker.module.css";

type Props = {
	values: number[];
	onPick: (val: number) => void;
	showLabel?: boolean;
	width?: number;
	id?: string;
};

export function SliderPicker({ onPick, values, showLabel, width, id }: Props) {
	const { t } = useTalkTranslation();
	return (
		<div className={style.container}>
			<UiSegmentedSlider
				id={id}
				defaultValue={width}
				values={values}
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
