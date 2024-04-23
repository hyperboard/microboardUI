import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

export function AddText() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.addText();
	};

	const isActive = Boolean(board.tools.getAddText());

	return (
		<UiButton
			tooltip={t("toolsPanel.addText.tooltip")}
			hotkey="T"
			onClick={handleClick}
			active={isActive}
		>
			<Icon width={14} height={16} iconName="AddText" />
		</UiButton>
	);
}
