import { Board } from "Board/Board";
import { conf } from "Board/Settings";
import { AudioItem } from "Board/Items/Audio/Audio";
import { calculateAudioPosition } from "Board/Items/Audio/AudioHelpers";

async function isAudioUrl(url: string): Promise<boolean> {
	try {
		const extension = url.split(".").pop()?.toLowerCase();
		if (extension && conf.AUDIO_FORMATS.includes(`.${extension}`)) {
			return true;
		}
		const response = await fetch(url, { method: "GET" });
		const contentType = response.headers.get("content-type");

		if (contentType) {
			return contentType.startsWith("audio/");
		}

		return false;
	} catch (error) {
		console.error("Error checking audio URL:", error);
		return false;
	}
}

export async function tryToPasteAudioByLink(
	link: string,
	board: Board,
): Promise<boolean> {
	try {
		if (await isAudioUrl(link)) {
			const audio = new AudioItem(link, board, false, board.events, "");
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
