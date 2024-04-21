import React from "react";
import { UndoIcon } from "ViewTalkIntegration/Icon/UndoIcon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import style from "./Undo.module.css";

export function Undo() {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.events?.undo();
	};

	const canUndo = board.events?.canUndo();

	return (
		<UiButton
			tooltip="Шаг назад"
			hotkey="⌘Z"
			className={style.button}
			onClick={handleClick}
			disabled={!canUndo}
		>
			<UndoIcon width={15} height={15} />
		</UiButton>
	);
}
