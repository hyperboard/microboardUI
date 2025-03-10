import React from "react";
import { useAppContext } from "features/AppContext";
import { FontSize } from "./FontSize";
import type { Connector } from "Board/Items";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

type Props = {
	rounded?: "none" | "left";
};

export function ConnectorFontSize({
	rounded = "none",
}: Props): JSX.Element | null {
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
			<FontSize rounded={rounded} />
			<UiSeparator vertical />
		</>
	);
}
