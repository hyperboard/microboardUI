import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "features/Pickers/SliderPicker/SliderPicker";
import { conf } from "microboard-temp";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { ButtonWithMenu } from "../../ButtonWithMenu";
import style from "./AddHighlighter.module.css";
import { useAddDrawingContext } from "../AddDrawingContext";
import { UiButton } from "shared/ui-lib/UiButton";
import {
	convertHexToRGBA,
	rgbaToRgb,
	rgbToRgba,
} from "shared/lib/convertColors";

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
			setSelectedColor(
				rgbToRgba(color, 0.5, conf.HIGHLIGHTER_DEFAULT_COLOR),
			);
			addHighlighter.setStrokeColor(
				rgbToRgba(color, 0.5, conf.HIGHLIGHTER_DEFAULT_COLOR),
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

	const isPredefinedColor = conf.HIGHLIGHTER_COLORS.some(
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
						min={conf.PEN_MIN_STROKE_WIDTH}
						max={conf.HIGHLIGHTER_MAX_STROKE_WIDTH}
						step={conf.PEN_STEP_STROKE_WIDTH}
						value={strokeWidth}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={
							selectedColor &&
							rgbaToRgb(selectedColor, conf.PEN_DEFAULT_COLOR)
						}
						onPick={handleColorPick}
						colors={conf.PEN_COLORS}
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
