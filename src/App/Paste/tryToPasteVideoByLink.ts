import { conf } from "microboard-temp";
import { Board } from "Board/Board";
import {
	getYouTubeThumbnail,
	getYouTubeVideoPreview,
} from "Board/Items/Video/VideoHelpers";
import { VideoItem } from "Board/Items/Video/Video";
import { calculatePosition } from "Board/Items/Image/calculatePosition";
import { notify } from "shared/ui-lib/Toast/notify";
import { t } from "i18next";

export function tryToPasteVideoByLink(link: string, board: Board): boolean {
	try {
		const url = new URL(link);
		url.pathname = url.pathname.replace("/shorts/", "/embed/");
		const finalUrl = url.toString();
		const youtubeId = conf.getYouTubeId(finalUrl);
		if (youtubeId) {
			createVideoItem(finalUrl, youtubeId, board);
			return true;
		}
	} catch {
		console.log("Can not get video id");
	}
	return false;
}

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
		})
		.catch(err => {
			notify({
				variant: "error",
				header: t("video.error.header"),
				body: t("video.error.body"),
				duration: 5000,
			});
			console.error(err);
		});
};
