import type { NotifyFunction } from "shared/ui-lib/Toast/notify";
import { VideoItem, Board, calculatePosition } from "microboard-temp";
import { getVideoMetadata, prepareVideo } from "./videoHelpers";
import { getApiUrl } from "Config";

export function uploadVideo(
  file: File,
  board: Board,
  notify: NotifyFunction,
  extension: "mp4" | "webm",
) {
  getVideoMetadata(file)
    .then((dimension) => {
      const videoItem = board.createItemAndAdd<VideoItem>("Video", {
        extension,
        videoDimension: dimension,
      });

      videoItem.doOnceBeforeOnLoad(() => {
        const { scaleX, scaleY, translateX, translateY } = calculatePosition(
          videoItem,
          board,
        );
        board.selection.removeAll();
        board.selection.add(videoItem);
        videoItem.apply({
          class: "Transformation",
          method: "setLocal",
          item: [videoItem.getId()],
          translateX,
          translateY,
          scaleX,
          scaleY,
        } as any);

        const notificationId = notify({
          variant: "info",
          header: window.MICROBOARD_CONFIG.i18n.t(
            "toolsPanel.addMedia.loading",
          ),
          body: "",
          duration: 100_000,
          loader: "MediaLoader",
        });
        prepareVideo(file, board.getBoardId(), getApiUrl())
          .then((urls) => {
            videoItem.apply({
              class: "Video",
              method: "setVideoData",
              url: urls.url,
              previewUrl: urls.previewUrl,
            } as any);
          })
          .catch((er) => {
            board.remove(videoItem);
            console.error("Could not create video:", er);
          })
          .finally(() =>
            window.MICROBOARD_CONFIG.disMissNotification(notificationId),
          );
      });
    })
    .catch((er) => {
      console.error("Could not create video:", er);
    });
}
