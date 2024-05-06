import { Board } from "Board";
import React from "react";

type TextColorSeparatorProps = {
	board: Board;
};

export function TextColorSeparator({
	board,
}: TextColorSeparatorProps): React.ReactElement | null {
	if (
		board.selection.getContext() !== "EditTextUnderPointer" &&
		!board.selection.canChangeText()
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
