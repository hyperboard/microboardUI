import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";

export function Duplicate() {
	const { board } = usePanelContext();

	const handleClick = () => {
		board.selection.duplicate();
	};

	return (
		<UiButton onClick={handleClick}>
			<Icon width={18} height={18} iconName="Copy" />
		</UiButton>
	);
}
