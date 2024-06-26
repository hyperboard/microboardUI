import { getHotkeyLabel } from "Board/Keyboard";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "ViewUpdate/Pickers/SliderPicker/SliderPicker";
import {
	MAX_DRAWING_STROKE_WIDTH,
	MIN_DRAWING_STROKE_WIDTH,
	PEN_COLORS,
	STEP_DRAWING_STROKE_WIDTH,
} from "ViewUpdate/Tools/AddDrawing";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiColorInput } from "ViewUpdate/Ui/UiColorInput";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import { ButtonWithMenu } from "../ButtonWithMenu/ButtonWithMenu";
import style from "./AddDrawing.module.css";

export function AddDrawing() {
	const [isColorSelected, setIsColorSelected] = useState(false);
	const { board } = useAppContext();
	const { t } = useTranslation();

	const addDrawing = board.tools.getAddDrawing();
	const isActive = Boolean(addDrawing);
	const selectedColor = addDrawing?.getStrokeColor();
	const strokeWidth = addDrawing?.getStrokeWidth();
	const isDrawing = addDrawing?.isDown;

	useEffect(() => {
		if (isDrawing) {
			setIsColorSelected(true);
		}
	}, [isDrawing]);

	const handleClick = () => {
		if (isActive && selectedColor !== "none" && isColorSelected) {
			setIsColorSelected(false);
		} else if (isActive && selectedColor !== "none") {
			setIsColorSelected(true);
		}
		if (!isActive || (isActive && selectedColor === "none")) {
			board.tools.addDrawing(true);
			setIsColorSelected(false);
		}
	};

	const handleSliderPick = (width: number): void => {
		if (addDrawing) {
			addDrawing.setStrokeWidth(width);
		}
	};

	const handleColorPick = (color: string): void => {
		if (addDrawing) {
			addDrawing.setStrokeColor(color);
			setIsColorSelected(true);
		}
	};

	const isPredefinedColor = PEN_COLORS.some(color => color === selectedColor);

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-drawing"}
					tooltip={t("toolsPanel.addDrawing.tooltip")}
					hotkey={getHotkeyLabel("pen")}
					active={isActive}
					variant="secondary"
					rounded="none"
					onClick={handleClick}
				>
					{selectedColor && selectedColor !== "none" && (
						<div
							className={style.indicator}
							style={{ backgroundColor: selectedColor }}
						/>
					)}
					<Icon iconName="Pen" />
				</UiButton>
			}
			isOpen={isActive && !isColorSelected}
		>
			<UiPanel vertical className={style.panel}>
				<div className={style.slider}>
					<SliderPicker
						onPick={handleSliderPick}
						min={MIN_DRAWING_STROKE_WIDTH}
						max={MAX_DRAWING_STROKE_WIDTH}
						step={STEP_DRAWING_STROKE_WIDTH}
						initialValue={strokeWidth}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={selectedColor}
						onPick={handleColorPick}
						colors={PEN_COLORS}
					/>
					<UiColorInput
						color={isPredefinedColor ? "none" : selectedColor}
						isActive={
							selectedColor !== "none" && !isPredefinedColor
						}
						onChange={handleColorPick}
					/>
				</div>
			</UiPanel>
		</ButtonWithMenu>
	);
}
