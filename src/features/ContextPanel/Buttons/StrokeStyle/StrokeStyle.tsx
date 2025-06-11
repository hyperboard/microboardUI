import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { StrokeColorIndicator } from "shared/ui-lib/Icon";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "features/Pickers/SliderPicker";
import { StrokeStylePicker } from "features/Pickers/StrokeStylePicker/StrokeStylePicker";
import {
	conf,
	MAX_STROKE_WIDTH,
	MIN_STROKE_WIDTH,
	STEP_STROKE_WIDTH,
	BorderStyle,
	Shape,
} from "microboard-temp";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StrokeStyle.module.css";
import { useAppContext } from "features/AppContext";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

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

	const isPredefinedColor = conf.SHAPE_STROKE_COLORS.some(
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
					hideTooltip={openedMenu === MENU_NAME}
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
							colors={conf.SHAPE_STROKE_COLORS}
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
