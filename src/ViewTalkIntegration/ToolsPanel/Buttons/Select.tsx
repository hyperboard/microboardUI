import { getHotkeyLabel } from "Board/Keyboard/hotkey";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

export function Select() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.select();
	};

	const isActive = Boolean(board.tools.getSelect());

	return (
		<UiButton
			tooltip={t("toolsPanel.select.tooltip")}
			hotkey={getHotkeyLabel("select")}
			onClick={handleClick}
			active={isActive}
		>
			<Icon width={17} height={17} iconName="Pointer" />
		</UiButton>
	);
}
