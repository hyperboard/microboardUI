import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import React, { useState } from "react";
import { AddDrawingContext } from "./AddDrawingContext";
import { UiButton } from "../../../Ui/UiButton";
import { Icon } from "../../../Icon";
import { ButtonWithMenu } from "../ButtonWithMenu";
import { useTranslation } from "react-i18next";
import { DrawingTool } from "../../../Tools/AddDrawing";
import style from "./AddDrawing.module.css";
import { AddHighlighter } from "./AddHighlighter/AddHighlighter";
import { AddPen } from "./AddPen/AddPen";
import { Eraser } from "./Eraser/Eraser";
import { useAppContext } from "../../../AppContext";
import { getHotkeyLabel } from "Board/Keyboard/getHotkeyLabel";

export function AddDrawing() {
	const [lastOpenedMenu, setLastOpenedMenu] = useState<DrawingTool | null>(
		null,
	);
	const { board } = useAppContext();
	const [selectedColor, setSelectedColor] = useState<string>("none");
	const { t } = useTranslation();

	const isActive = Boolean(
		board.tools.getAddDrawing() ||
			board.tools.getAddHighlighter() ||
			board.tools.getEraser(),
	);

	const handleClick = () => {
		switch (lastOpenedMenu) {
			case "Pen": {
				board.tools.addDrawing(true);
				break;
			}
			case "Highlighter": {
				board.tools.addHighlighter(true);
				break;
			}
			case "Eraser": {
				board.tools.eraser(true);
				break;
			}
			default: {
				board.tools.addDrawing(true);
				break;
			}
		}
		setLastOpenedMenu(lastOpenedMenu || "Pen");
	};

	const getTooltip = () => {
		if (isActive) {
			return undefined;
		}
		switch (lastOpenedMenu) {
			case "Pen": {
				return t("toolsPanel.addDrawing.addPen.tooltip");
			}
			case "Highlighter": {
				return t("toolsPanel.addDrawing.addHighlighter.tooltip");
			}
			case "Eraser": {
				return t("toolsPanel.addDrawing.addEraser.tooltip");
			}
			default: {
				return t("toolsPanel.addDrawing.addPen.tooltip");
			}
		}
	};

	return (
		<AddDrawingContext.Provider
			value={{
				setLastOpenedMenu,
				lastOpenedMenu,
				setSelectedColor,
			}}
		>
			<ButtonWithMenu
				button={
					<UiButton
						id={"tool-add-drawing"}
						tooltip={getTooltip()}
						hotkey={
							lastOpenedMenu !== "Eraser" &&
							lastOpenedMenu !== "Highlighter"
								? getHotkeyLabel("pen")
								: undefined
						}
						active={isActive}
						variant="secondary"
						rounded="none"
						onClick={handleClick}
					>
						{selectedColor && selectedColor !== "none" && (
							<div
								className={style.indicator}
								style={{ backgroundColor: selectedColor }}
							/>
						)}
						<Icon iconName={lastOpenedMenu || "Pen"} />
					</UiButton>
				}
				isOpen={isActive}
			>
				<UiPanel vertical padding={0} className={style.panel}>
					<AddPen />
					<AddHighlighter />
					<Eraser />
				</UiPanel>
			</ButtonWithMenu>
		</AddDrawingContext.Provider>
	);
}
