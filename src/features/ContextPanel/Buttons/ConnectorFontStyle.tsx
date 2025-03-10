import React from "react";
import { useAppContext } from "features/AppContext";
import { Connector } from "../../../Board/Items";
import { FontStyle } from "./FontStyle";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

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
