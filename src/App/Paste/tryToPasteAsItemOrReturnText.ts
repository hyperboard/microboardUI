import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";
import { transformHtmlOrTextToMarkdown } from "Board/Items/RichText/transformHtmlToMarkdown";

const isMarkdown = (text: string): boolean => {
	if (!text) {
		return false;
	}

	const markdownPatterns = [
		/^#{1,6}\s.+/, // Заголовки (# H1, ## H2, ...)
		/^\*\s.+|^-\s.+/, // Маркированные списки (* item, - item)
		/^\d+\.\s.+/, // Нумерованные списки (1. item)
		/\*\*(.*?)\*\*/, // Жирный текст (**bold**)
		/\*(.*?)\*/, // Курсив (*italic*)
		/__(.*?)__/, // Альтернативный жирный (__bold__)
		/_(.*?)_/, // Альтернативный курсив (_italic_)
		/~~(.*?)~~/, // Зачеркнутый текст (~~strikethrough~~)
		/\[.*?\]\(.*?\)/, // Ссылки [text](url)
		/!\[.*?\]\(.*?\)/, // Картинки ![alt](url)
		/^> .+/, // Цитаты (> quote)
		/^```[\s\S]*```/, // Блоки кода (```code```)
		/^-{3,}$/, // Горизонтальная линия (---)
	];

	return markdownPatterns.some(pattern => pattern.test(text));
};

export async function tryToPasteAsItemOrReturnText(
	event: ClipboardEvent,
	board: Board,
	isLoggedIn: boolean,
): Promise<DataTransfer | null> {
	if (tryToPasteFromMiro(event, board, isLoggedIn)) {
		preventPasteDefault(event);
		return null;
	}
	let dataTransfer = event?.clipboardData;

	const html = dataTransfer?.getData("text/html");
	const text = dataTransfer?.getData("text/plain");

	if (
		text &&
		html &&
		!dataTransfer?.getData("application/x-slate-fragment")
	) {
		try {
			if (!isMarkdown(text) && html) {
				dataTransfer = await transformHtmlOrTextToMarkdown(text, html);
			} else {
				dataTransfer = await transformHtmlOrTextToMarkdown(text);
			}
		} catch (err) {
			console.warn("Error while parsing html to markdown", err);
		}
	}

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

	return dataTransfer;
}

export function preventPasteDefault(event: ClipboardEvent): void {
	event.preventDefault();
	event.stopPropagation();
}
