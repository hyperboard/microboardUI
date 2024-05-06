import { Board } from "Board";
import React from "react";

type PathStyleSeparatorProps = {
	board: Board;
};

export function PathStyleSeparator({
	board,
}: PathStyleSeparatorProps): React.ReactElement | null {
	const canChangeBorderStyle = board.selection.items.isItemTypes([
		"Shape",
		"Drawing",
	]);
	const context = board.selection.getContext();
	const canChangeFillStyle = board.selection.items.isItemTypes([
		"Shape",
		"Sticker",
	]);
	if (
		context === "SelectUnderPointer" ||
		(!canChangeFillStyle && !canChangeBorderStyle)
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
