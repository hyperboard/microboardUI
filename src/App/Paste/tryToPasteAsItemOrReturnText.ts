import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";
import { transformHtmlOrTextToMarkdown } from "Board/Items/RichText/transformHtmlToMarkdown";
import { SETTINGS } from "Board/Settings";

const isMarkdown = (text: string): boolean => {
	if (!text || typeof text !== "string") {
		return false;
	}

	// Улучшенные паттерны Markdown
	const markdownPatterns = [
		/^#{1,6}\s.+/m, // Заголовки (# H1, ## H2, ...)
		/^\s*[-*]\s.+/m, // Маркированные списки (* item, - item)
		/^\s*\d+\.\s.+/m, // Нумерованные списки (1. item)
		/\*\*[^*]+\*\*/, // Жирный текст (**bold**)
		/(^|\s)\*[^*]+\*(\s|$)/, // Курсив (*italic*) (исключаем случайные * в тексте)
		/__(.*?)__/, // Альтернативный жирный (__bold__)
		/(^|\s)_[^_]+_(\s|$)/, // Альтернативный курсив (_italic_)
		/~~[^~]+~~/, // Зачеркнутый текст (~~strikethrough~~)
		/\[.+\]\(.+\)/, // Ссылки [text](url)
		/!\[.*?\]\(.*?\)/, // Картинки ![alt](url)
		/^> .+/m, // Цитаты (> quote)
		/^```[\s\S]*```$/m, // Блоки кода (```code```)
		/^-{3,}$/m, // Горизонтальная линия (---)
	];

	// Проверяем, содержит ли текст хотя бы ОДИН из markdown-паттернов
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
	const shouldSkipMarkdownTransform = Boolean(
		textEditor?.getSelection() &&
			textEditor.hasTextInSelection() &&
			SETTINGS.URL_REGEX.test(text),
	);

	if (
		!dataTransfer?.getData("application/x-slate-fragment") &&
		!shouldSkipMarkdownTransform
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
