import { Board } from "Board";
export { default as CopyLinkFrame } from "./CopyLinkFrame";
export { default as SaveFrameAsImage } from "./SaveFrameAsImage";
export { default as ToggleFrameRatio } from "./ToggleFrameRatio";

export function canShowFrameSetting(board: Board): boolean {
	const context = board.selection.getContext();
	const canShareLink = board.selection.items.isItemTypes(["Frame"]);
	const isSingle = board.selection.items.isSingle();
	if (context === "SelectUnderPointer" || !canShareLink || !isSingle) {
		return false;
	}
	return true;
}
