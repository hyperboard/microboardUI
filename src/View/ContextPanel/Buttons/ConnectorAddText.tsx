import React from "react";
import { Board } from "Board";
import { Connector, Mbr } from "Board/Items";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { useTranslation } from "react-i18next";

const IconSize = 24;

type ConnectorAddTextProps = {
	board: Board;
	panelMbr: Mbr;
	windowHeight: number;
};

export function ConnectorAddText({
	board,
	panelMbr,
	windowHeight,
}: ConnectorAddTextProps): React.ReactElement | null {
	const { t } = useTranslation();
	const menuRef = React.useRef<HTMLDivElement>(null);

	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
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
		<ButtonWithMenu
			panelMbr={panelMbr}
			windowHeight={windowHeight}
			menuRef={menuRef}
		>
			<UiButton
				id="ConnectorAddText"
				onClick={handleClick}
				title={t("contextPanel.connectorAddText.tooltip")}
			>
				<Icon name="AddText" width={IconSize} height={IconSize} />
			</UiButton>
		</ButtonWithMenu>
	);
}
