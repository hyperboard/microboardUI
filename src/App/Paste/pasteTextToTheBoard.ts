import { RichText, Board, Mbr } from "microboard-temp";

export function pasteTextToTheBoard(board: Board, data: DataTransfer): void {
	const richText = new RichText(board, new Mbr());
	richText.transformation.translateTo(
		board.pointer.point.x,
		board.pointer.point.y,
	);
	richText.transformation.scaleBy(1, 1);
	richText.editor.maxWidth = 600;
	richText.editor.setSelectionHorisontalAlignment("left");
	richText.insideOf = richText.itemType;
	try {
		richText.editor.editor.insertData(data);
	} catch (error) {
		console.error(error);
	}
	board.add(richText);
}
