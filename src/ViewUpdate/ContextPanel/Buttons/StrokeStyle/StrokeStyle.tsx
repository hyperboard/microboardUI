import { BorderStyle } from "Board/Items/Path";
import { ButtonWithMenu } from "ViewUpdate/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { StrokeColorIndicator } from "ViewUpdate/Icon";
import { ColorPicker } from "ViewUpdate/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "ViewUpdate/Pickers/SliderPicker";
import { StrokeStylePicker } from "ViewUpdate/Pickers/StrokeStylePicker/StrokeStylePicker";
import {
	MAX_STROKE_WIDTH,
	MIN_STROKE_WIDTH,
	STEP_STROKE_WIDTH,
	STROKE_COLORS,
} from "ViewUpdate/Tools/AddShape";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import { UiColorInput } from "ViewUpdate/Ui/UiColorInput";
import { UiPanel } from "ViewUpdate/Ui/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StrokeStyle.module.css";
import { useAppContext } from "ViewUpdate/AppContext";

const MENU_NAME = "StrokeStyle";

export function StrokeStyle(): React.ReactElement | null {
	const { toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();
	const { board } = useAppContext();
	const { t } = useTranslation();

	const borderColor = board.selection.getStrokeColor();
	const borderWidth = board.selection.getStrokeWidth();
	const borderStyle = board.selection.getBorderStyle();

	const handleClick = () => {
		toggleMenu(MENU_NAME);
	};

	const handleStrokeWidthPick = (width: number) => {
		board.selection.setStrokeWidth(width);
	};

	const handleStrokeStylePick = (style: BorderStyle) => {
		board.selection.setStrokeStyle(style);
		toggleMenu("None");
	};

	const handleStrokeColorPick = (color: string) => {
		board.selection.setStrokeColor(color);
		toggleMenu("None");
	};

	const handleStrokeCustomColorPick = (color: string) => {
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
					<div className={style.panel}>
						<StrokeStylePicker
							stroke={borderStyle}
							onPick={handleStrokeStylePick}
						/>
					</div>
					<SliderPicker
						initialValue={borderWidth}
						onPick={handleStrokeWidthPick}
						min={MIN_STROKE_WIDTH}
						max={MAX_STROKE_WIDTH}
						step={STEP_STROKE_WIDTH}
						showLabel
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
						/>
					</div>
				</UiPanel>
			)}
		</ButtonWithMenu>
	);
}
