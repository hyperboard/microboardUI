import { Board } from "microboard-temp";
import {
  tryToPasteImages,
  tryToPasteFromMiro,
  tryToPasteFromMicroboard,
} from ".";
import { tryToGetMarkdownFromDataTransfer } from "App/Paste/tryToGetMarkdownFromDataTransfer";
import { tryToPasteVideoByLink } from "App/Paste/tryToPasteVideoByLink";
import { tryToPasteAudioByLink } from "App/Paste/tryToPasteAudioByLink";

export async function tryToPasteAsItemOrReturnText(
  event: ClipboardEvent | null,
  dataTransfer: DataTransfer | null,
  board: Board,
  isLoggedIn: boolean,
  accessToken: string | null,
): Promise<DataTransfer | null> {
  if (tryToPasteFromMiro(dataTransfer, board, accessToken, isLoggedIn)) {
    event && preventPasteDefault(event);
    return null;
  }

  const text = dataTransfer?.getData("text/plain");

  if (!text) {
    if (tryToPasteImages(dataTransfer, board, accessToken)) {
      event && preventPasteDefault(event);
    }
    return null;
  }

  if (tryToPasteFromMicroboard(text, board)) {
    event && preventPasteDefault(event);
    return null;
  }

  const textEditor = board.selection.items.getSingle()?.getRichText()?.editor;

  if (text && !textEditor?.getSelection() && window.enableVideos) {
    if (tryToPasteVideoByLink(text, board)) {
      event && preventPasteDefault(event);
      return null;
    }

    if (tryToPasteAudioByLink(text, board)) {
      event && preventPasteDefault(event);
      return null;
    }
  }

  if (dataTransfer) {
    const markdownDataTransfer = await tryToGetMarkdownFromDataTransfer(
      dataTransfer,
      textEditor,
    );
    if (markdownDataTransfer) {
      return markdownDataTransfer;
    }
  }

  if (tryToPasteImages(dataTransfer, board, accessToken)) {
    event && preventPasteDefault(event);
    return null;
  }

  return dataTransfer;
}

export function preventPasteDefault(event: ClipboardEvent): void {
  event.preventDefault();
  event.stopPropagation();
}
