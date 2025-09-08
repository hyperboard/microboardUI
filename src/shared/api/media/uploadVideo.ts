import type { NotifyFunction } from "shared/ui-lib/Toast/notify";
import {
  VideoItem,
  createVideoItem,
  getVideoMetadata,
  prepareVideo,
  Board,
} from "microboard-temp";
import { getIdFromUrl, updateMediaUsage } from "App/MediaHelpers";

export function uploadVideo(
  file: File,
  board: Board,
  notify: NotifyFunction,
  extension: "mp4" | "webm",
  accessToken: string | null,
) {
  getVideoMetadata(file)
    .then((dimension) => {
      const onLoadCb = (videoItem: VideoItem) => {
        const notificationId = notify({
          variant: "info",
          header: window.MICROBOARD_CONFIG.i18n.t(
            "toolsPanel.addMedia.loading",
          ),
          body: "",
          duration: 100_000,
          loader: "MediaLoader",
        });
        prepareVideo(file, accessToken, board.getBoardId())
          .then((urls) => {
            updateMediaUsage(
              [getIdFromUrl(urls.url), getIdFromUrl(urls.previewUrl)],
              board.getBoardId(),
            );
            videoItem.setVideoData(urls);
          })
          .catch((er) => {
            board.remove(videoItem);
            console.error("Could not create video:", er);
          })
          .finally(() =>
            window.MICROBOARD_CONFIG.disMissNotification(notificationId),
          );
      };
      createVideoItem(
        board,
        extension,
        { videoDimension: dimension },
        onLoadCb,
      );
    })
    .catch((er) => {
      console.error("Could not create video:", er);
    });
}
