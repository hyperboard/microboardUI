import { Board } from "Board";
import React from "react";

type ItemTypeSeparatorProps = {
	board: Board;
};

export function ItemTypeSeparator({
	board,
}: ItemTypeSeparatorProps): React.ReactElement | null {
	const canChangeItemType = board.selection.items.isItemTypes(["Shape"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangeItemType
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
