import { Board } from "microboard-temp";
import type { BoardSnapshot } from "microboard-temp";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";

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
}: {
  board: Board;
  snapshot: BoardSnapshot;
}) => {
  const itemsMap = {};
  for (const itemData of snapshot.items) {
    const id = itemData.id;
    delete itemData.id;
    itemsMap[id] = itemData;
  }
  if (board.events && snapshot) {
    board.paste(itemsMap, true, false);
    if (!board.tools.getSelect()) {
      board.tools.select();
    }
    const itemsMbr = board.items.getMbr();
    board.camera.zoomToFit(itemsMbr);
  }
};

export async function fetchTemplateSnapshot(
  templateId: string,
): Promise<BoardSnapshot> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = Cookies.get("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${getApiUrl()}/templates/${templateId}/connect`,
    { method: "POST", headers },
  );

  if (!response.ok) {
    throw new Error(`Failed to connect to template: ${response.status}`);
  }

  const { wsUrl, jwt } = await response.json();

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${wsUrl}?token=${jwt}`);

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Template connection timed out"));
    }, 15000);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "BoardSubscriptionCompleted") {
          clearTimeout(timeout);
          ws.close();
          resolve(data.JSONSnapshot as BoardSnapshot);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Template WS connection failed"));
    };
  });
}
