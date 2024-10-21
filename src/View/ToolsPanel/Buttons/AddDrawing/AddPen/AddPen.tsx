import { getHotkeyLabel } from "Board/Keyboard";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker/SliderPicker";
import {
	MAX_DRAWING_STROKE_WIDTH,
	MIN_DRAWING_STROKE_WIDTH,
	PEN_COLORS,
	STEP_DRAWING_STROKE_WIDTH,
} from "View/Tools/AddDrawing";
import { UiButton } from "View/Ui/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { ButtonWithMenu } from "../../ButtonWithMenu";
import style from "./AddPen.module.css";
import { AddDrawingContext, useAddDrawingContext } from "../AddDrawingContext";

export function AddPen() {
	const [isColorSelected, setIsColorSelected] = useState(false);
	const { board } = useAppContext();
	const { t } = useTranslation();
	const { setSelectedColor, setLastOpenedMenu } = useAddDrawingContext();

	const addDrawing = board.tools.getAddDrawing();
	const isActive = Boolean(addDrawing);
	const selectedColor = addDrawing?.getStrokeColor();
	const strokeWidth = addDrawing?.getStrokeWidth();
	const isDrawing = addDrawing?.isDown;

	useEffect(() => {
		if (isActive) {
			setSelectedColor(selectedColor || "none");
			setLastOpenedMenu("Pen");
		}
		if (isDrawing) {
			setIsColorSelected(true);
		}
	}, [isDrawing, isActive]);

	const handleClick = () => {
		if (isActive && selectedColor !== "none" && isColorSelected) {
			setIsColorSelected(false);
		} else if (isActive && selectedColor !== "none") {
			setIsColorSelected(true);
		}
		if (!isActive || (isActive && selectedColor === "none")) {
			board.tools.addDrawing(true);
			setSelectedColor(selectedColor || "none");
			setLastOpenedMenu("Pen");
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
			setSelectedColor(color);
			addDrawing.setStrokeColor(color);
			setIsColorSelected(true);
		}
	};

	const handleCustomColorPick = (color: string): void => {
		if (addDrawing) {
			setSelectedColor(color);
			addDrawing.setStrokeColor(color);
		}
	};

	const isPredefinedColor = PEN_COLORS.some(color => color === selectedColor);

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-drawing"}
					tooltip={
						isActive
							? undefined
							: t("toolsPanel.addDrawing.addPen.tooltip")
					}
					hotkey={getHotkeyLabel("pen")}
					active={isActive}
					variant="secondary"
					rounded="top"
					onClick={handleClick}
				>
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
						value={strokeWidth}
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
						onChange={handleCustomColorPick}
						setIsCloseMenu={setIsColorSelected}
					/>
				</div>
			</UiPanel>
		</ButtonWithMenu>
	);
}
