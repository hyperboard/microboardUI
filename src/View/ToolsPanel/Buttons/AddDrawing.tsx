import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { useTranslation } from "react-i18next";
import { PenIcon } from "View/Icon/PenIcon";
import { ColorPicker } from "View/Pickers/ColorPicker";
import { SliderPicker } from "View/Pickers/SliderPicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
	width: number;
};

export function AddDrawing({ board, isOn, width }: Props) {
	const { t } = useTranslation();
	const handleButtonClick = (): void => {
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

	return (
		<div className="ToolsPanelMenuContainer">
			<UiButton
				id="AddDrawing"
				onClick={handleButtonClick}
				title={t("toolsPanel.addDrawing.tooltip")}
				hotkey={getHotkeyLabel("pen")}
				isOn={isOn}
				tipOnLeft
			>
				<PenIcon
					color={board.tools.getAddDrawing()?.strokeStyle}
					width={24}
					height={24}
				></PenIcon>
			</UiButton>
			<div
				id="AddDrawingMenu"
				className="ToolsPanelMenu"
				style={{
					width: "140px",
					visibility: isOn ? "visible" : "hidden",
					marginTop: "-180px",
				}}
			>
				<SliderPicker onPick={handleSliderPick} width={width} />
				<ColorPicker onPick={handleColorPick} />
			</div>
		</div>
	);
}
