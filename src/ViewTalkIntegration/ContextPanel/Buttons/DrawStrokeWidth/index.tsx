import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { UiSlider } from "ViewTalkIntegration/Ui/UiSlider";

export function DrawStrokeWidth() {
	const { board } = usePanelContext();

	const width = board.selection.getStrokeWidth();
	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	return <UiSlider onPick={handleSliderPick} width={width} />;
}
