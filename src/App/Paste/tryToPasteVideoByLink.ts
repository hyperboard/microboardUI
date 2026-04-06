import {
  getYouTubeThumbnail,
  getYouTubeVideoPreview,
  VideoItem,
  Board,
  calculatePosition,
} from "microboard-temp";
import { notify } from "shared/ui-lib/Toast/notify";
import { t } from "i18next";

export function tryToPasteVideoByLink(link: string, board: Board): boolean {
  try {
    const url = new URL(link);
    url.pathname = url.pathname.replace("/shorts/", "/embed/");
    const finalUrl = url.toString();
    const youtubeId = window.MICROBOARD_CONFIG.getYouTubeId(finalUrl);
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
    .then((preview) => {
      const videoItem = board.createItemAndAdd<VideoItem>("Video", {
        videoDimension: {
          width: preview.width,
          height: preview.height,
        },
        url,
        previewUrl,
      });

      videoItem.doOnceBeforeOnLoad(() => {
        const { scaleX, scaleY, translateX, translateY } = calculatePosition(
          videoItem,
          board,
        );

        videoItem.apply({
          class: "Transformation",
          method: "setLocal",
          item: [videoItem.getId()],
          translateX,
          translateY,
          scaleX,
          scaleY,
        } as any);

        board.selection.removeAll();
        board.selection.add(videoItem);
      });
    })
    .catch((err) => {
      notify({
        variant: "error",
        header: t("video.error.header"),
        body: t("video.error.body"),
        duration: 5000,
      });
      console.error(err);
    });
};
