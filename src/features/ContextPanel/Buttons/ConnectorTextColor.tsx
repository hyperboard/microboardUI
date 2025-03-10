import React from "react";
import { useAppContext } from "features/AppContext";
import { Connector } from "../../../Board/Items";
import { TextColor } from "./TextColor";

export function ConnectorTextColor(): React.ReactElement | null {
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

	return <TextColor />;
}
