import { Connector } from "Board/Items";
import React from "react";
import { usePanelContext } from "ViewTalkIntegration/ContextPanel/PanelContext";
import { TextColorIndicator } from "ViewTalkIntegration/Icon";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";

export function ConnectorAddText(): React.ReactElement | null {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const context = board.selection.getContext();
	if (context === "EditTextUnderPointer") {
		return null;
	}

	const handleClick = () => {
		if (board.selection.getContext() === "EditTextUnderPointer") {
			board.selection.setContext("EditUnderPointer");
			board.items.subject.publish(board.items);
			return;
		}
		const connector = board.selection.items.getItemsByItemTypes([
			"Connector",
		])[0] as Connector;
		if (!connector) {
			return;
		}
		board.selection.setTextToEdit(connector);
		board.selection.setContext("EditTextUnderPointer");
		board.items.subject.publish(board.items);
	};

	return (
		<UiButton
			tooltip={t("contextPanel.connectorAddText.tooltip")}
			tooltipPosition="top"
			onClick={handleClick}
		>
			<TextColorIndicator color="none" />
		</UiButton>
	);
}
