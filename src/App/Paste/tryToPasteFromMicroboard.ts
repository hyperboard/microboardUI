import { Board } from "Board";
import { validateItemsMap } from "Board/Validators";

export function tryToPasteFromMicroboard(text: string, board: Board): boolean {
	try {
		const data = JSON.parse(text);
		const isDataValid = validateItemsMap(data);
		if (isDataValid) {
			board.paste(data);
			return true;
		}
	} catch (error) {
		console.error(error);
		// TODO: popup notification
	}
	return false;
}
