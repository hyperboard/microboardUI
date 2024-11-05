import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker/SliderPicker";
import {
	MAX_DRAWING_STROKE_WIDTH,
	MIN_DRAWING_STROKE_WIDTH,
	STEP_DRAWING_STROKE_WIDTH,
	PEN_COLORS,
	HIGHLIGHTER_COLORS,
	DEFAULT_PEN_COLOR,
	DEFAULT_HIGHLIGHTER_COLOR,
} from "View/Tools/AddDrawing";
import { UiButton } from "View/Ui/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { ButtonWithMenu } from "../../ButtonWithMenu";
import style from "./AddHighlighter.module.css";
import { useAddDrawingContext } from "../AddDrawingContext";

const convertHexToRGBA = (hex: string, alpha = 0.5) => {
	const tempHex = hex.replace("#", "");
	const r = parseInt(tempHex.substring(0, 2), 16);
	const g = parseInt(tempHex.substring(2, 4), 16);
	const b = parseInt(tempHex.substring(4, 6), 16);

	return `rgba(${r},${g},${b},${alpha})`;
};

function rgbToRgba(rgbColor: string, alpha = 0.5) {
	const rgb = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	if (!rgb) {
		return DEFAULT_HIGHLIGHTER_COLOR;
	}
	const [r, g, b] = rgb.slice(1);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToRgb(rgbaColor: string) {
	try {
		const rgba = rgbaColor.match(
			/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+)?)\)$/,
		);
		if (!rgba) {
			return DEFAULT_PEN_COLOR;
		}
		const [r, g, b, a] = rgba.slice(1);
		return `rgb(${r}, ${g}, ${b})`;
	} catch {
		return DEFAULT_PEN_COLOR;
	}
}

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
			setSelectedColor(rgbToRgba(color));
			addHighlighter.setStrokeColor(rgbToRgba(color));
			setIsColorSelected(true);
		}
	};

	const handleCustomColorPick = (color: string): void => {
		if (addHighlighter) {
			const RGBA = convertHexToRGBA(color);
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
						max={MAX_DRAWING_STROKE_WIDTH}
						step={STEP_DRAWING_STROKE_WIDTH}
						value={strokeWidth}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={
							selectedColor && rgbaToRgb(selectedColor)
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
