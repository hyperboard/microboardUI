import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";

export function tryToPasteAsItemOrReturnText(
	event: ClipboardEvent,
	board: Board,
	isLoggedIn: boolean,
): string | null {
	if (tryToPasteFromMiro(event, board, isLoggedIn)) {
		preventPasteDefault(event);
		return null;
	}

	const text = event?.clipboardData?.getData("text/plain");

	if (!text) {
		if (tryToPasteImages(event, board)) {
			preventPasteDefault(event);
		}
		return null;
	}

	if (tryToPasteFromMicroboard(text, board)) {
		preventPasteDefault(event);
		return null;
	}

	if (tryToPasteImages(event, board)) {
		preventPasteDefault(event);
		return null;
	}

	return text;
}

export function preventPasteDefault(event: ClipboardEvent): void {
	event.preventDefault();
	event.stopPropagation();
}
