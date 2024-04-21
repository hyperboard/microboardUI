import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";

export function AddText() {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.tools.addText();
	};

	const isActive = Boolean(board.tools.getAddText());

	return (
		<UiButton
			tooltip="Текст"
			hotkey="T"
			onClick={handleClick}
			active={isActive}
		>
			<Icon width={14} height={16} iconName="AddText" />
		</UiButton>
	);
}
