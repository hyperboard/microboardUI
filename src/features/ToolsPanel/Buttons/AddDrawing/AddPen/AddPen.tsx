import { getHotkeyLabel } from "Board/Keyboard";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "features/Pickers/SliderPicker/SliderPicker";
import { SETTINGS } from "Board/Settings";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { ButtonWithMenu } from "../../ButtonWithMenu";
import style from "./AddPen.module.css";
import { useAddDrawingContext } from "../AddDrawingContext";
import { UiButton } from "shared/ui-lib/UiButton";

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

	const isPredefinedColor = SETTINGS.PEN_COLORS.some(
		color => color === selectedColor,
	);

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
						min={SETTINGS.PEN_MIN_STROKE_WIDTH}
						max={SETTINGS.PEN_MAX_STROKE_WIDTH}
						step={SETTINGS.PEN_STEP_STROKE_WIDTH}
						value={strokeWidth}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={selectedColor}
						onPick={handleColorPick}
						colors={SETTINGS.PEN_COLORS}
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
