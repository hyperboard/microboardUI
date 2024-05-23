import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { UndoIcon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./Undo.module.css";

export function Undo() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.events?.undo();
	};

	const canUndo = board.events?.canUndo();

	return (
		<UiButton
			id={"undo"}
			tooltip={t("toolsPanel.undo.tooltip")}
			hotkey={getHotkeyLabel("undo")}
			className={style.button}
			onClick={handleClick}
			disabled={!canUndo}
		>
			<UndoIcon width={16} height={16} />
		</UiButton>
	);
}
