import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker/SliderPicker";
import {
	MIN_DRAWING_STROKE_WIDTH,
	STEP_DRAWING_STROKE_WIDTH,
	PEN_COLORS,
	HIGHLIGHTER_COLORS,
	DEFAULT_PEN_COLOR,
	DEFAULT_HIGHLIGHTER_COLOR,
	MAX_HIGHLIGHTER_STROKE_WIDTH,
} from "View/Tools/AddDrawing";
import { UiButton } from "View/Ui/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { ButtonWithMenu } from "../../ButtonWithMenu";
import style from "./AddHighlighter.module.css";
import { useAddDrawingContext } from "../AddDrawingContext";
import { convertHexToRGBA, rgbaToRgb, rgbToRgba } from "utils";

export function AddHighlighter() {
	const [isColorSelected, setIsColorSelected] = useState(false);
	const { board } = useAppContext();
	const { t } = useTranslation();
	const { setSelectedColor, setLastOpenedMenu } = useAddDrawingContext();

	const addHighlighter = board.tools.getAddHighlighter();
	const isActive = Boolean(addHighlighter);
	const selectedColor = addHighlighter?.getStrokeColor();
	const strokeWidth = addHighlighter?.getStrokeWidth();
	const isDrawing = addHighlighter?.isDown;

	useEffect(() => {
		if (isActive) {
			setSelectedColor(selectedColor || "none");
			setLastOpenedMenu("Highlighter");
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
			board.tools.addHighlighter(true);
			setSelectedColor(selectedColor || "none");
			setLastOpenedMenu("Pen");
			setIsColorSelected(false);
		}
	};

	const handleSliderPick = (width: number): void => {
		if (addHighlighter) {
			addHighlighter.setStrokeWidth(width);
		}
	};

	const handleColorPick = (color: string): void => {
		if (addHighlighter) {
			setSelectedColor(rgbToRgba(color, 0.5, DEFAULT_HIGHLIGHTER_COLOR));
			addHighlighter.setStrokeColor(
				rgbToRgba(color, 0.5, DEFAULT_HIGHLIGHTER_COLOR),
			);
			setIsColorSelected(true);
		}
	};

	const handleCustomColorPick = (color: string): void => {
		if (addHighlighter) {
			const RGBA = convertHexToRGBA(color, true);
			setSelectedColor(RGBA);
			addHighlighter.setStrokeColor(RGBA);
		}
	};

	const isPredefinedColor = HIGHLIGHTER_COLORS.some(
		color => color === selectedColor,
	);

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-highlighter"}
					tooltip={
						isActive
							? undefined
							: t("toolsPanel.addDrawing.addHighlighter.tooltip")
					}
					active={isActive}
					variant="secondary"
					rounded="none"
					onClick={handleClick}
				>
					<Icon iconName="Highlighter" />
				</UiButton>
			}
			isOpen={isActive && !isColorSelected}
		>
			<UiPanel vertical className={style.panel}>
				<div className={style.slider}>
					<SliderPicker
						onPick={handleSliderPick}
						min={MIN_DRAWING_STROKE_WIDTH}
						max={MAX_HIGHLIGHTER_STROKE_WIDTH}
						step={STEP_DRAWING_STROKE_WIDTH}
						value={strokeWidth}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={
							selectedColor &&
							rgbaToRgb(selectedColor, DEFAULT_PEN_COLOR)
						}
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
