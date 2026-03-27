import type { NotifyFunction } from "shared/ui-lib/Toast/notify";
import {
  Board,
  calculateAudioPosition,
  prepareAudio,
  AudioItem,
  conf,
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

  const audio = new AudioItem(board, undefined, board.events, "", extension);
  const { scaleX, scaleY, translateX, translateY } = calculateAudioPosition(
    board,
    audio,
  );
  audio.transformation.setLocal(translateX, translateY, scaleX, scaleY);
  audio.updateMbr();
  const boardAudio = board.add(audio);
  board.selection.removeAll();
  board.selection.add(boardAudio);

  prepareAudio(file, conf.getAccessToken(), board.getBoardId(), getApiUrl())
    .then((url) => {
      boardAudio.setUrl(url);
    })
    .catch((er) => {
      board.remove(boardAudio);
      console.error("Could not create audio:", er);
    })
    .finally(() =>
      window.MICROBOARD_CONFIG.disMissNotification(notificationId),
    );
}
