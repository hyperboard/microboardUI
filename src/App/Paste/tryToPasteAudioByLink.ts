import { Board, AudioItem, calculateAudioPosition } from "microboard-temp";

function isAudioUrl(url: string): boolean {
  const extension = url.split(".").pop()?.toLowerCase();
  return (
    url.startsWith("https://") &&
    !!extension &&
    window.MICROBOARD_CONFIG.AUDIO_FORMATS.includes(extension)
  );
}

export function tryToPasteAudioByLink(link: string, board: Board): boolean {
  if (isAudioUrl(link)) {
    const boardAudio = board.createItemAndAdd<AudioItem>("Audio", {
      url: link,
      extension: link.split(".").pop()?.toLowerCase(),
    });

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
    return true;
  }
  return false;
}
