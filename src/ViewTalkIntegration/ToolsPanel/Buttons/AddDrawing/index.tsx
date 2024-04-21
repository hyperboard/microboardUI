import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { ColorPicker } from "ViewTalkIntegration/Pickers/ColorPicker";
import { SliderPicker } from "ViewTalkIntegration/Pickers/SliderPicker";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel";
import { ButtonWithMenu } from "../ButtonWithMenu";
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

	const handleClick = () => {
		board.tools.addDrawing();
	};

	const handleSliderPick = (width: number): void => {
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.strokeWidth = width;
			board.tools.publish();
		}
	};

	const handleColorPick = (color: string): void => {
		const addDrawing = board.tools.getAddDrawing();
		if (addDrawing) {
			addDrawing.strokeStyle = color;
			board.tools.publish();
		}
	};

	const isActive = Boolean(board.tools.getAddDrawing());
	const strokeWidth = board.tools.getAddDrawing()?.strokeWidth ?? 0;
	const selectedColor = board.tools.getAddDrawing()?.strokeStyle;

	return (
		<ButtonWithMenu
			button={
				<UiButton
					tooltip="Карандаш"
					hotkey="B"
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
						width={strokeWidth}
						onPick={handleSliderPick}
						showLabel
					/>
					{/* <UiSegmentedSlider
						values={sliderValues}
						onChange={console.log.bind(console)}
					/> */}
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
