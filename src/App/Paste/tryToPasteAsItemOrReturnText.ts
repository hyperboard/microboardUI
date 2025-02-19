import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";
import { transformHtmlToMarkdown } from "Board/Items/RichText/transformHtmlToMarkdown";

export async function tryToPasteAsItemOrReturnText(
	event: ClipboardEvent,
	board: Board,
	isLoggedIn: boolean,
): Promise<string | null | { markdown: string }> {
	if (tryToPasteFromMiro(event, board, isLoggedIn)) {
		preventPasteDefault(event);
		return null;
	}
	const html = event?.clipboardData?.getData("text/html");
	if (html) {
		return { markdown: await transformHtmlToMarkdown(html) };
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
