import { Board } from "Board";
import { Mbr } from "Board/Items";
import { RichText } from "Board/Items/RichText/RichText";

export function pasteTextToTheBoard(board: Board, text: string): void {
	const richText = new RichText(new Mbr());
	richText.transformation.translateTo(
		board.pointer.point.x,
		board.pointer.point.y,
	);
	richText.transformation.scaleBy(1, 1);
	richText.editor.setMaxWidth(600);
	richText.editor.setSelectionHorisontalAlignment("left");
	richText.insideOf = richText.itemType;
	richText.editor.insertText(text);
	board.add(richText);
}
