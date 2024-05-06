import { Board } from "Board";
import React from "react";

type TextFeaturesSeparatorProps = { board: Board };

export function TextFeaturesSeparator({
	board,
}: TextFeaturesSeparatorProps): React.ReactElement | null {
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

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
