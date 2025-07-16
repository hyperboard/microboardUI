import { validateItemsMap, Board } from "microboard-temp";

export function tryToPasteFromMicroboard(text: string, board: Board): boolean {
  try {
    const data = JSON.parse(text);
    const isDataValid = validateItemsMap(data);
    if (isDataValid) {
      board.paste(data);
      return true;
    }
  } catch (error) {
    console.warn("Data is not an item, trying to paste as text");
  }
  return false;
}
