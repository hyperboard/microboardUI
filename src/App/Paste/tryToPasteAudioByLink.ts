import { Board } from "Board/Board";
import { conf } from "microboard-temp";
import { AudioItem } from "Board/Items/Audio/Audio";
import { calculateAudioPosition } from "Board/Items/Audio/AudioHelpers";

function isAudioUrl(url: string): boolean {
	const extension = url.split(".").pop()?.toLowerCase();
	return !(
		!url.startsWith("https://") ||
		!extension ||
		!conf.AUDIO_FORMATS.includes(extension)
	);
}

export function tryToPasteAudioByLink(link: string, board: Board): boolean {
	try {
		if (isAudioUrl(link)) {
			const audio = new AudioItem(board, false, link, board.events, "");
			const { scaleX, scaleY, translateX, translateY } =
				calculateAudioPosition(board, audio);
			audio.transformation.applyTranslateTo(translateX, translateY);
			audio.transformation.applyScaleTo(scaleX, scaleY);
			audio.updateMbr();
			const boardAudio = board.add(audio);
			board.selection.removeAll();
			board.selection.add(boardAudio);
			return true;
		}
	} catch (error) {
		console.error("Error while parsing audio url:", error);
	}
	return false;
}
