import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";

export function ConnectorAddText(): React.ReactElement | null {
	const { board } = useAppContext();
	const { t } = useTranslation();

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
		])[0];
		if (!connector) {
			return;
		}
		board.selection.setTextToEdit(connector);
		board.selection.setContext("EditTextUnderPointer");
		board.items.subject.publish(board.items);
	};

	return (
		<UiButton
			id={"connector-add-text"}
			tooltip={t("contextPanel.connectorAddText.tooltip")}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="AddText" />
		</UiButton>
	);
}
