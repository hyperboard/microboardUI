import React from "react";
import { UiSegmentedSlider } from "ViewTalkIntegration/Ui/UiSegmentedSlider";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./SliderPicker.module.css";

type Props = {
	values: number[];
	onPick: (val: number) => void;
	showLabel?: boolean;
};

export function SliderPicker({ onPick, values, showLabel }: Props) {
	const { t } = useTalkTranslation();
	return (
		<div className={style.container}>
			<UiSegmentedSlider values={values} onChange={onPick} />
			{showLabel && (
				<label className={style.label}>
					{t("toolsPanel.addDrawing.strokeWidth")}
				</label>
			)}
		</div>
	);
}
