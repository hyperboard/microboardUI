import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { SliderPicker } from "ViewTalkIntegration/Pickers/SliderPicker";

const sliderValues = [1, 2, 4, 6, 8, 12];

export function DrawStrokeWidth() {
	const { board } = usePanelContext();

	const width = board.selection.getStrokeWidth();

	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	return (
		<SliderPicker
			width={width}
			onPick={handleSliderPick}
			values={sliderValues}
		/>
	);
}
