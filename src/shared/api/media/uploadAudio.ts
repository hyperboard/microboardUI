import type { NotifyFunction } from "shared/ui-lib/Toast/notify";
import {
  Board,
  calculateAudioPosition,
  prepareAudio,
  AudioItem,
} from "microboard-temp";
import { getApiUrl } from "Config";

export function uploadAudio(
  file: File,
  board: Board,
  notify: NotifyFunction,
  extension: string,
) {
  const notificationId = notify({
    variant: "info",
    header: window.MICROBOARD_CONFIG.i18n.t("toolsPanel.addMedia.loading"),
    body: "",
    duration: 100_000,
    loader: "MediaLoader",
  });

  const boardAudio = board.createItemAndAdd<AudioItem>("Audio", { extension });
  const { scaleX, scaleY, translateX, translateY } = calculateAudioPosition(
    board,
    boardAudio,
  );
  boardAudio.apply({
    class: "Transformation",
    method: "setLocal",
    item: [boardAudio.getId()],
    translateX,
    translateY,
    scaleX,
    scaleY,
  } as any);
  board.selection.removeAll();
  board.selection.add(boardAudio);

  prepareAudio(file, board.getBoardId(), getApiUrl())
    .then((url) => {
      boardAudio.apply({
        class: "Audio",
        method: "setUrl",
        url,
      } as any);
    })
    .catch((er) => {
      board.remove(boardAudio);
      console.error("Could not create audio:", er);
    })
    .finally(() =>
      window.MICROBOARD_CONFIG.disMissNotification(notificationId),
    );
}
