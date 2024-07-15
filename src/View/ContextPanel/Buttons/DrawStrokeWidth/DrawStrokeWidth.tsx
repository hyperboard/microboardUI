import { SliderPicker } from "View/Pickers/SliderPicker/SliderPicker";
import {
	MAX_DRAWING_STROKE_WIDTH,
	MIN_DRAWING_STROKE_WIDTH,
	STEP_DRAWING_STROKE_WIDTH,
} from "View/Tools/AddDrawing";
import React from "react";
import style from "./DrawStrokeWidth.module.css";
import { useAppContext } from "View/AppContext";

export function DrawStrokeWidth() {
	const { board } = useAppContext();

	const width = board.selection.getStrokeWidth();

	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	return (
		<div className={style.container}>
			<SliderPicker
				id={"drawing-stroke-width"}
				value={width}
				onPick={handleSliderPick}
				min={MIN_DRAWING_STROKE_WIDTH}
				max={MAX_DRAWING_STROKE_WIDTH}
				step={STEP_DRAWING_STROKE_WIDTH}
			/>
		</div>
	);
}
