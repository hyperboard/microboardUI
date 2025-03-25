import { SliderPicker } from "features/Pickers/SliderPicker/SliderPicker";
import { conf } from "Board/Settings";
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
					width < conf.PEN_MAX_STROKE_WIDTH
						? width
						: conf.PEN_MAX_STROKE_WIDTH
				}
				onPick={handleSliderPick}
				min={conf.PEN_MIN_STROKE_WIDTH}
				max={conf.PEN_MAX_STROKE_WIDTH}
				step={conf.PEN_STEP_STROKE_WIDTH}
			/>
		</div>
	);
}
