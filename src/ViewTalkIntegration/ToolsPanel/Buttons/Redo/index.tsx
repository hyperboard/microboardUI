import React from "react";
import { RedoIcon } from "ViewTalkIntegration/Icon/RedoIcon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";
import style from "./Redo.module.css";

export function Redo() {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.events?.redo();
	};

	const canUndo = board.events?.canRedo();

	return (
		<UiButton
			tooltip="Шаг вперед"
			hotkey="⌘⇧Z"
			className={style.button}
			onClick={handleClick}
			disabled={!canUndo}
		>
			<RedoIcon width={15} height={15} />
		</UiButton>
	);
}
