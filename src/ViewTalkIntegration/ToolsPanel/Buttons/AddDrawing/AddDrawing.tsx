import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker/ColorPicker";
import { SliderPicker } from "ViewTalkIntegration/Pickers/SliderPicker/SliderPicker";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { ButtonWithMenu } from "../ButtonWithMenu/ButtonWithMenu";
import style from "./AddDrawing.module.css";

const drawingColors = [
	"#2291FF",
	"#FFBE00",
	"#00CCAE",
	"#3DBC5D",
	"#B750D1",
	"#F03B36",
	"#000000",
	"#FFFFFF",
];

const sliderValues = [1, 2, 4, 6, 8, 12];

export function AddDrawing() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.addDrawing();
	};

	const handleSliderPick = (width: number): void => {
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.setStrokeWidth(width);
		}
	};

	const handleColorPick = (color: string): void => {
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.setStrokeColor(color);
		}
	};

	const isActive = Boolean(board.tools.getAddDrawing());
	const selectedColor = board.tools.getAddDrawing()?.getStrokeColor();

	return (
		<ButtonWithMenu
			button={
				<UiButton
					id={"tool-add-drawing"}
					tooltip={t("toolsPanel.addDrawing.tooltip")}
					hotkey={getHotkeyLabel("pen")}
					active={isActive}
					onClick={handleClick}
				>
					<Icon width={18} height={18} iconName="Pen" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel vertical className={style.panel}>
				<div className={style.slider}>
					<SliderPicker
						onPick={handleSliderPick}
						values={sliderValues}
						showLabel
					/>
				</div>
				<div className={style.colors}>
					<ColorPicker
						selectedColor={selectedColor}
						onPick={handleColorPick}
						colors={drawingColors}
					/>
				</div>
			</UiPanel>
		</ButtonWithMenu>
	);
}
