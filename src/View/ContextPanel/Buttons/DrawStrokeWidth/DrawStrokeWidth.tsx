import { SliderPicker } from "View/Pickers/SliderPicker/SliderPicker";
import {
	MAX_DRAWING_STROKE_WIDTH,
	MAX_HIGHLIGHTER_STROKE_WIDTH,
	MIN_DRAWING_STROKE_WIDTH,
	STEP_DRAWING_STROKE_WIDTH,
} from "View/Tools/AddDrawing";
import React from "react";
import style from "./DrawStrokeWidth.module.css";
import { useAppContext } from "View/AppContext";
import { ConnectionLineWidths } from "Board/Items/Connector/Connector";

export function DrawStrokeWidth(): React.ReactElement {
	const { board } = useAppContext();

	const width = board.selection.getStrokeWidth();

	const handleSliderPick = (width: number): void => {
		board.selection.setStrokeWidth(ConnectionLineWidths[width]);
	};

	return (
		<div className={style.container}>
			<SliderPicker
				id={"drawing-stroke-width"}
				value={width}
				onPick={handleSliderPick}
				min={MIN_DRAWING_STROKE_WIDTH}
				max={
					width > MAX_DRAWING_STROKE_WIDTH
						? MAX_HIGHLIGHTER_STROKE_WIDTH
						: MAX_DRAWING_STROKE_WIDTH
				}
				step={STEP_DRAWING_STROKE_WIDTH}
			/>
		</div>
	);
}
