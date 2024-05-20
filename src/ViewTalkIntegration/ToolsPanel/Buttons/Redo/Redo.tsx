import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { RedoIcon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import style from "./Redo.module.css";

export function Redo() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.events?.redo();
	};

	const canUndo = board.events?.canRedo();

	return (
		<UiButton
			id={"redo"}
			tooltip={t("toolsPanel.redo.tooltip")}
			hotkey={getHotkeyLabel("redo")}
			className={style.button}
			onClick={handleClick}
			disabled={!canUndo}
		>
			<RedoIcon width={16} height={16} />
		</UiButton>
	);
}
