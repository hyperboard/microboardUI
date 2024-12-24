import { BorderStyle } from "Board/Items/Path";
import { ButtonWithMenu } from "View/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { StrokeColorIndicator } from "View/Icon";
import { ColorPicker } from "View/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { StrokeStylePicker } from "View/Pickers/StrokeStylePicker/StrokeStylePicker";
import {
	MAX_STROKE_WIDTH,
	MIN_STROKE_WIDTH,
	STEP_STROKE_WIDTH,
	STROKE_COLORS,
} from "View/Tools/AddShape";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { UiColorInput } from "View/Ui/UiColorInput";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StrokeStyle.module.css";
import { useAppContext } from "View/AppContext";
import { Shape } from "../../../../Board/Items";
import btnStyle from "../ContextPanelButton.module.css";

const MENU_NAME = "StrokeStyle";

const getIsBorderStyleEditable = (shapes: Shape[]): boolean => {
	for (const shape of shapes) {
		if (!shape.getIsBorderStyleEditable()) {
			return false;
		}
	}
	return true;
};

export function StrokeStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const borderColor = board.selection.getStrokeColor();
	const borderWidth = board.selection.getStrokeWidth();
	const borderStyle = board.selection.getBorderStyle();

	const isBorderStyleEditable = getIsBorderStyleEditable(
		board.selection.items.getItemsByItemTypes(["Shape"]) as Shape[],
	);

	const handleClick = (): void => {
		toggleMenu(MENU_NAME);
	};

	const handleStrokeWidthPick = (width: number): void => {
		board.selection.setStrokeWidth(width);
	};

	const handleStrokeStylePick = (style: BorderStyle): void => {
		board.selection.setStrokeStyle(style);
		toggleMenu("None");
	};

	const handleStrokeColorPick = (color: string): void => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};

	const handleStrokeCustomColorPick = (color: string): void => {
		board.selection.setStrokeColor(color);
	};

	const isPredefinedColor = STROKE_COLORS.some(
		color => color === borderColor,
	);

	return (
		<ButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton
					className={btnStyle.contextPanelButton}
					id={"stroke-style"}
					tooltip={t("contextPanel.strokeStyle.tooltip")}
					tooltipPosition="top"
					onClick={handleClick}
					variant="secondary"
					active={openedMenu === MENU_NAME}
					rounded="none"
				>
					<StrokeColorIndicator color={borderColor} />
				</UiButton>
			}
		>
			{verticalAlign => (
				<UiPanel
					rounded={verticalAlign === "bottom" ? "bottom" : "full"}
					vertical
					className={style.menu}
				>
					{isBorderStyleEditable && (
						<div className={style.panel}>
							<StrokeStylePicker
								stroke={borderStyle}
								onPick={handleStrokeStylePick}
							/>
						</div>
					)}
					<SliderPicker
						value={borderWidth}
						onPick={handleStrokeWidthPick}
						min={MIN_STROKE_WIDTH}
						max={MAX_STROKE_WIDTH}
						step={STEP_STROKE_WIDTH}
						showLabel
						id="shape-stroke-width"
					/>
					<div className={style.colors}>
						<ColorPicker
							id={"stroke-style"}
							colors={STROKE_COLORS}
							onPick={handleStrokeColorPick}
							selectedColor={borderColor}
						/>
						<UiColorInput
							onChange={handleStrokeCustomColorPick}
							color={isPredefinedColor ? "none" : borderColor}
							isActive={
								borderColor !== "none" && !isPredefinedColor
							}
							toggleMenu={toggleMenu}
						/>
					</div>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
