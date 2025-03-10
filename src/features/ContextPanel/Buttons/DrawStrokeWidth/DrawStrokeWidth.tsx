import { SliderPicker } from "features/Pickers/SliderPicker/SliderPicker";
import {
	PEN_MAX_STROKE_WIDTH,
	PEN_MIN_STROKE_WIDTH,
	PEN_STEP_STROKE_WIDTH,
} from "Board/Settings";
import React from "react";
import style from "./DrawStrokeWidth.module.css";
import { useAppContext } from "features/AppContext";

export function DrawStrokeWidth(): React.ReactElement {
	const { board } = useAppContext();

	const width = board.selection.getStrokeWidth();

	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	return (
		<div className={style.container}>
			<SliderPicker
				id={"drawing-stroke-width"}
				value={
					width < PEN_MAX_STROKE_WIDTH ? width : PEN_MAX_STROKE_WIDTH
				}
				onPick={handleSliderPick}
				min={PEN_MIN_STROKE_WIDTH}
				max={PEN_MAX_STROKE_WIDTH}
				step={PEN_STEP_STROKE_WIDTH}
			/>
		</div>
	);
}
