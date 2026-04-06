import { RichText, Board } from "microboard-temp";

export function pasteTextToTheBoard(board: Board, data: DataTransfer): void {
  const richText = board.createItemAndAdd<RichText>("RichText", {
    maxWidth: 600,
    verticalAlignment: "center",
  });

  richText.apply({
    class: "Transformation",
    method: "translateTo",
    item: [richText.getId()],
    x: board.pointer.point.x,
    y: board.pointer.point.y,
  } as any);

  try {
    richText.editor.editor.insertData(data);
  } catch (error) {
    console.error(error);
  }
}
