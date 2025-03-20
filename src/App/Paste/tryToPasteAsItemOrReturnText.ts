import { Board } from "Board";
import {
	tryToPasteImages,
	tryToPasteFromMiro,
	tryToPasteFromMicroboard,
} from ".";
import { transformHtmlOrTextToMarkdown } from "Board/Items/RichText/transformHtmlToMarkdown";
import { SETTINGS } from "Board/Settings";
import { VideoItem } from "Board/Items/Video/Video";
import { calculatePosition } from "Board/Items/Image/calculatePosition";
import {
	getYouTubeThumbnail,
	getYouTubeVideoPreview,
} from "Board/Items/Video/VideoHelpers";

const isMarkdown = (text: string): boolean => {
	if (!text || typeof text !== "string") {
		return false;
	}

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

	return markdownPatterns.some(pattern => pattern.test(text));
};

const createVideoItem = (url: string, youtubeId: string, board: Board) => {
	const previewUrl = getYouTubeThumbnail(youtubeId, "maxres");
	getYouTubeVideoPreview(previewUrl)
		.then(preview => {
			const videoItem = new VideoItem(
				{
					videoDimension: {
						width: preview.width,
						height: preview.height,
					},
					url,
					previewUrl,
				},
				board,
				board.events,
				"",
			);
			videoItem.doOnceBeforeOnLoad(() => {
				const { scaleX, scaleY, translateX, translateY } =
					calculatePosition(videoItem, board);
				videoItem.transformation.applyTranslateTo(
					translateX,
					translateY,
				);
				videoItem.transformation.applyScaleTo(scaleX, scaleY);
				videoItem.updateMbr();
				const boardVideo = board.add(videoItem);
				board.selection.removeAll();
				board.selection.add(boardVideo);
			});
			// videoItem.updateMbr();
			//
			// const { scaleX, scaleY, translateX, translateY } =
			// 	calculatePosition(videoItem, board);
			// videoItem.transformation.applyTranslateTo(translateX, translateY);
			// videoItem.transformation.applyScaleTo(scaleX, scaleY);
			// videoItem.updateMbr();
			// const boardVideo = board.add(videoItem);
			// board.selection.removeAll();
			// board.selection.add(boardVideo);
		})
		.catch(err => {
			console.error(err);
		});
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

	if (!textEditor?.getSelection() && window.enableVideos) {
		const url = new URL(text);
		url.pathname = url.pathname.replace("/shorts/", "/embed/");
		const finalUrl = url.toString();
		const youtubeId = SETTINGS.getYouTubeId(finalUrl);
		if (youtubeId) {
			createVideoItem(finalUrl, youtubeId, board);
			return null;
		}
	}

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
