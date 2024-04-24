import React from "react";
import { Board } from "Board";

type ConnectorStyleSeparatorProps = {
	board: Board;
};

export function ConnectorStyleSeparator({
	board,
}: ConnectorStyleSeparatorProps): React.ReactElement | null {
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}
	return (
		<div
			style={{
				display: "flex",
				marginLeft: "5px",
				marginRight: "5px",
				width: "1px",
				backgroundColor: "rgb(230, 230, 230)",
			}}
		></div>
	);
}
