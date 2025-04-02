import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";
import { tryToGetMarkdownFromDataTransfer } from "App/Paste/tryToGetMarkdownFromDataTransfer";
import { tryToPasteVideoByLink } from "App/Paste/tryToPasteVideoByLink";
import { tryToPasteAudioByLink } from "App/Paste/tryToPasteAudioByLink";

export async function tryToPasteAsItemOrReturnText(
	event: ClipboardEvent,
	board: Board,
	isLoggedIn: boolean,
): Promise<DataTransfer | null> {
	if (tryToPasteFromMiro(event, board, isLoggedIn)) {
		preventPasteDefault(event);
		return null;
	}
	const dataTransfer = event?.clipboardData;

	const text = dataTransfer?.getData("text/plain");

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

	const textEditor = board.selection.items.getSingle()?.getRichText()?.editor;

	if (text && !textEditor?.getSelection() && window.enableVideos) {
		if (tryToPasteVideoByLink(text, board)) {
			preventPasteDefault(event);
			return null;
		}

		if (tryToPasteAudioByLink(text, board)) {
			preventPasteDefault(event);
			return null;
		}
	}

	if (dataTransfer) {
		const markdownDataTransfer = await tryToGetMarkdownFromDataTransfer(
			dataTransfer,
			textEditor,
		);
		if (markdownDataTransfer) {
			return markdownDataTransfer;
		}
	}

	if (tryToPasteImages(event, board)) {
		preventPasteDefault(event);
		return null;
	}

	return dataTransfer;
}

export function preventPasteDefault(event: ClipboardEvent): void {
	event.preventDefault();
	event.stopPropagation();
}
