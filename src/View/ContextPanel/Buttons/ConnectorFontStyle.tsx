import React from "react";
import { useAppContext } from "View/AppContext";
import { Connector } from "../../../Board/Items";
import { UiSeparator } from "../../Ui/UiSeparator";
import { FontStyle } from "./FontStyle";

export function ConnectorFontStyle(): React.ReactElement | null {
	const { board } = useAppContext();

	const connector = board.selection.items.getItemsByItemTypes([
		"Connector",
	])[0] as Connector;
	const context = board.selection.getContext();
	if (
		context !== "EditTextUnderPointer" &&
		connector &&
		!connector.hasText()
	) {
		return null;
	}

	return (
		<>
			<FontStyle />
			<UiSeparator vertical />
		</>
	);
}
