import { BorderStyle } from "Board/Items/Path";
import clsx from "clsx";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { StrokeColorIndicator } from "ViewTalkIntegration/Icon/StrokeColorIndicator";
import { StrokeStylePicker } from "ViewTalkIntegration/Pickers/BorderStylePicker";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiButtonWithMenu } from "ViewTalkIntegration/ContextPanel/Buttons/ButtonWithMenu";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { UiSlider } from "ViewTalkIntegration/Ui/UiSlider";
import style from "./StrokeStyle.module.css";

const MENU_NAME = "StrokeStyle";

const strokeColors = [
	"#000000",
	"#2291FF",
	"#FFBE00",
	"#3DBC5D",
	"#B750D1",
	"#00CCAE",
	"#F03B36",
	"#FFFFFF",
];

export function StrokeStyle(): React.ReactElement | null {
	const { board, toggleMenu, openedMenu, panelMbr, windowHeight } =
		usePanelContext();

	const borderColor = board.selection.getStrokeColor();
	const borderStyle = board.selection.getBorderStyle();
	const borderWidth = board.selection.getStrokeWidth();

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
	return (
		<UiButtonWithMenu
			menuName={MENU_NAME}
			openedMenu={openedMenu}
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			align="left"
			button={
				<UiButton onClick={handleClick}>
					<StrokeColorIndicator color={borderColor} />
				</UiButton>
			}
		>
			<UiPanel vertical className={style.menu}>
				<div className={style.panel}>
					<StrokeStylePicker
						stroke={borderStyle}
						onPick={handleStrokeStylePick}
					/>
				</div>
				<div className={style.slider}>
					<UiSlider
						onPick={handleStrokeWidthPick}
						width={borderWidth}
					/>
					<p className={style.sliderLabel}>Толщина линии</p>
				</div>
				<div className={clsx(style.colors)}>
					<ColorPicker
						allowNone
						isNotLast
						colors={strokeColors}
						onPick={handleStrokeColorPick}
						selectedColor={borderColor}
					/>
				</div>
			</UiPanel>
		</UiButtonWithMenu>
	);
}
