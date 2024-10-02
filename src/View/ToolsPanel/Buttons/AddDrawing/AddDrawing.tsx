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
import { AddEraser } from "./AddEraser/AddEraser";
import { useAppContext } from "../../../AppContext";

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
			board.tools.getAddEraser(),
	);
	const handleClick = () => {
		if (isActive) return;
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
				board.tools.addEraser(true);
				break;
			}
			default: {
				board.tools.addDrawing(true);
				break;
			}
		}
		setLastOpenedMenu(lastOpenedMenu || "Pen");
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
						tooltip={t("toolsPanel.addDrawing.addPen.tooltip")}
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
					<AddEraser />
				</UiPanel>
			</ButtonWithMenu>
		</AddDrawingContext.Provider>
	);
}
