import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";

export function Select() {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.tools.select();
	};

	const isActive = Boolean(board.tools.getSelect());

	return (
		<UiButton
			tooltip="Выделение"
			hotkey="S"
			onClick={handleClick}
			active={isActive}
		>
			<Icon width={17} height={17} iconName="Pointer" />
		</UiButton>
	);
}
