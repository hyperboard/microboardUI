import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton";

export function SwitchPointers(): React.ReactElement | null {
	const { board } = usePanelContext();

	const handleClick = () => {
		const start = board.selection.getStartPointerStyle();
		const end = board.selection.getEndPointerStyle();
		board.selection.setStartPointerStyle(end);
		board.selection.setEndPointerStyle(start);
	};

	return (
		<UiButton onClick={handleClick}>
			<Icon width={18} height={18} iconName="PointerRoll" />
		</UiButton>
	);
}
