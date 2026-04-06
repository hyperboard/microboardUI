import Cookies from "js-cookie";
import type { App } from "App";
import { isIframe } from "./isIframe";
import {
  Board,
  exportBoardScreenshot,
  ExportScreenshot,
} from "microboard-temp";

// type MessagePattern = "updateUserToken" | "iframeEvent" | "makeSnapshot";

interface SetAuthPayload {
  accessToken: string;
  refreshToken: string;
}

interface KeyboardPayload {
  tagName?: string;
  event: {
    type: "keyboardEvent";
    eventType: string;
    eventData: {
      key: string;
      code: string;
      ctrlKey: string;
      shiftKey: boolean;
      altKey: boolean;
      bubbles?: boolean;
      metaKey: boolean;
      repeat: boolean;
      target?: string | HTMLElement;
    };
  };
}

interface SnapshotPayload {
  name?: string;
}

interface SetAuthTokenMessage {
  pattern: "updateUserToken";
  payload: SetAuthPayload;
}

interface KeyboardEventMessage {
  pattern: "iframeEvent";
  payload: KeyboardPayload;
}

interface MakeSnapshotMessage {
  pattern: "makeSnapshot";
  payload: SnapshotPayload;
}

interface FireSnapshotEvent {
  pattern: "fireSnapshotEvent";
  payload: unknown;
}

type SetToolArgument = Parameters<Board["tools"]["setTool"]>[0];

type Message =
  | SetAuthTokenMessage
  | KeyboardEventMessage
  | MakeSnapshotMessage
  | FireSnapshotEvent;

export class IframeModule {
  private static instance: IframeModule | null = null;
  // private origins: string[];
  private app: App;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(app: App, origins?: string[]) {
    // this.origins = origins || [];
    this.app = app;
    this.setEventListeners();
  }

  private setEventListeners(): void {
    if (!isIframe()) {
      return;
    }
    window.addEventListener(
      "message",
      async (event: MessageEvent<Message>) => {
        // if (!this.allowOrigins(event, this.origins)) {
        //   return;
        // }
        await this.handleCustomMessages(event.data);
      },
      false,
    );
  }

  static getInstance(app: App, origins?: string[]): IframeModule {
    if (!IframeModule.instance) {
      IframeModule.instance = new IframeModule(app, origins);
    }
    return IframeModule.instance;
  }

  // No feature requests for now
  // private allowOrigins(
  //     event: MessageEvent<Message>,
  //     origins: string[],
  // ): boolean {
  //     for (const origin of origins) {
  //         if (event.origin !== origin) {
  //             return false;
  //         }
  //     }
  //     return true;
  // }

  private async handleCustomMessages(data: Message): Promise<void> {
    try {
      console.log("Message: ", data);

      if (data.pattern === "updateUserToken") {
        Cookies.set("mb_accessToken", data.payload.accessToken, {
          secure: false,
        });
        Cookies.set("mb_refreshToken", data.payload.refreshToken, {
          secure: false,
        });
      }

      if (data.pattern === "makeSnapshot") {
        if (!isIframe()) {
          console.warn("Not in an iframe, snapshot creation aborted");
          return;
        }

        const board: Board = this.app.getBoard() as Board;

        if (!board) {
          console.error("Board not found");
          this.sendSnapshotError("Board not found");
          return;
        }

        try {
          const cachedSelection = board.selection.items.list();
          board.selection.addAll();

          const snapshot = await exportBoardScreenshot({
            board,
            selection: board.selection.getMbr()!,
            nameToExport:
              data.payload.name || `board-${board.getBoardId()}.png`,
            upscaleTo: 4000,
          });

          board.selection.removeAll();
          board.selection.add(cachedSelection);

          if (snapshot && snapshot.dataUrl) {
            this.sendSnapshotCreated(snapshot);
          } else {
            this.sendSnapshotError("Invalid snapshot data");
          }
        } catch (error) {
          console.error("Error creating snapshot:", error);
          this.sendSnapshotError("Failed to create snapshot");
        } finally {
          board.selection.removeAll();
        }
      }

      if (data.pattern === "fireSnapshotEvent") {
        const board: Board = this.app.getBoard() as Board;
        board.tools.setTool(
          new ExportScreenshot(board) as unknown as SetToolArgument,
        );
        board.tools.publish();
      }

      if (data.pattern === "iframeEvent") {
        if (isIframe()) {
          const keyboardEvent = new KeyboardEvent(
            data.payload.event.eventType,
            {
              ...data.payload.event.eventData,
            } as unknown as KeyboardEventInit,
          );
          window.self.dispatchEvent(keyboardEvent);
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown iframe error";
      window.parent.postMessage(
        {
          pattern: "MicroboardError",
          payload: JSON.stringify({ error: message }),
        },
        "*",
      );
    }
  }

  private sendSnapshotCreated(snapshot: {
    dataUrl: string;
    nameToExport: string;
  }): void {
    window.parent.postMessage(
      {
        pattern: "snapshotCreated",
        payload: JSON.stringify(snapshot),
      },
      "*",
    );
  }

  private sendSnapshotError(errorMessage: string): void {
    window.parent.postMessage(
      {
        pattern: "snapshotError",
        payload: JSON.stringify({ error: errorMessage }),
      },
      "*",
    );
  }
}

export function redirectParentPage(url: string, parentUrl: string) {
  window.parent.postMessage(
    {
      type: "open-new-window",
      url,
    },
    parentUrl,
  );
}
