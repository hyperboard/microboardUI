import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { Icon } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

export function SwitchPointers(): React.ReactElement | null {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();
	const handleClick = () => {
		const start = board.selection.getStartPointerStyle();
		const end = board.selection.getEndPointerStyle();
		board.selection.setStartPointerStyle(end);
		board.selection.setEndPointerStyle(start);
	};

	return (
		<UiButton
			id={"switch-pointers"}
			tooltip={t("contextPanel.connectorSwitchPointers.tooltip")}
			tooltipPosition="top"
			onClick={handleClick}
		>
			<Icon width={18} height={18} iconName="PointerRoll" />
		</UiButton>
	);
}
