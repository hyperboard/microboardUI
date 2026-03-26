import { Board } from "microboard-temp";
import type { BoardSnapshot } from "microboard-temp";

export function detectLanguage(text: string) {
  const scores = {};

  const regexes = {
    en: /[\u0000-\u007F]/gi,
    zh: /[\u3000\u3400-\u4DBF\u4E00-\u9FFF]/gi,
    hi: /[\u0900-\u097F]/gi,
    ar: /[\u0621-\u064A\u0660-\u0669]/gi,
    bn: /[\u0995-\u09B9\u09CE\u09DC-\u09DF\u0985-\u0994\u09BE-\u09CC\u09D7\u09BC]/gi,
    he: /[\u0590-\u05FF]/gi,
    ru: /[\u0400-\u04FF]/gi,
  };
  for (const [lang, regex] of Object.entries(regexes)) {
    // detect occurances of lang in a word
    const matches = text.match(regex) || [];
    const score = matches.length / text.length;
    if (score) {
      // high percentage, return result
      if (score > 0.85) {
        return lang;
      }
      scores[lang] = score;
    }
  }
  // not detected
  if (Object.keys(scores).length == 0) {
    return "en";
  }
  // pick lang with highest percentage
  return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
}

export const pasteSnapshot = ({
  board,
  snapshot,
  shouldEmit = false,
}: {
  board: Board;
  snapshot: BoardSnapshot;
  shouldEmit?: boolean;
}) => {
  const baseUrl = window.location.origin;
  const storageIndex = baseUrl === "https://dev-app.microboard.io" ? 0 : 1;

  const itemsMap: Record<string, any> = {};
  for (const itemData of snapshot.items) {
    const { id, ...itemWithoutId } = Object.assign({}, itemData);

    if (
      itemWithoutId.itemType === "Image" &&
      Array.isArray(itemWithoutId.storageLink)
    ) {
      itemWithoutId.storageLink = itemWithoutId.storageLink[storageIndex];
    }

    itemsMap[id] = itemWithoutId;
  }
  if (board.events && snapshot) {
    board.paste(itemsMap, false, shouldEmit);
    if (!board.tools.getSelect()) {
      board.tools.select();
    }
    const itemsMbr = board.items.getMbr();
    board.camera.zoomToFit(itemsMbr);
  }
};

export async function fetchTemplateSnapshot(
  templateId: string,
  language?: string,
): Promise<BoardSnapshot> {
  if (language) {
    const langResponse = await fetch(
      `/templates/${templateId}/snapshot_${language}.json`,
    );
    if (langResponse.ok) {
      return await langResponse.json();
    }
  }

  const response = await fetch(`/templates/${templateId}/snapshot.json`);

  if (!response.ok) {
    throw new Error(`Failed to load template snapshot: ${response.status}`);
  }

  return await response.json();
}
