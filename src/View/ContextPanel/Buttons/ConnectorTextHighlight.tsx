import React from "react";
import { useAppContext } from "View/AppContext";
import { Connector } from "../../../Board/Items";
import { UiSeparator } from "../../Ui/UiSeparator";
import { TextHighlight } from "./TextHighlight";

export function ConnectorTextHighlight(): React.ReactElement | null {
	const { board } = useAppContext();

	const connector = board.selection.items.getItemsByItemTypes([
		"Connector",
	])[0] as Connector | undefined;
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
			<TextHighlight />
			<UiSeparator vertical />
		</>
	);
}
