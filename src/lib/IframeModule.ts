import Cookies from "js-cookie";
import { isIframe } from "./isIframe";
import { exportBoardSnapshot } from "Board/Tools/ExportSnapshot/exportBoardSnapshot";
import { App } from "App";
import { Quality } from "Board/Tools/ExportSnapshot/types";
import { Board } from "Board";

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
	quality: Quality;
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

type Message = SetAuthTokenMessage | KeyboardEventMessage | MakeSnapshotMessage;

export class IframeModule {
	private origins: string[];
	private app: App;

	constructor(app: App, origins?: string[]) {
		this.origins = origins || [];
		this.app = app;
		this.setEventListeners();
	}

	private setEventListeners(): void {
		if (!isIframe()) {
			return;
		}
		window.addEventListener(
			"message",
			(event: MessageEvent<Message>) => {
				// if (!this.allowOrigins(event, this.origins)) {
				//   return;
				// }
				this.handleCustomMessages(event.data);
			},
			false,
		);
	}

	private allowOrigins(
		event: MessageEvent<Message>,
		origins: string[],
	): boolean {
		for (const origin of origins) {
			if (event.origin !== origin) {
				return false;
			}
		}
		return true;
	}

	private handleCustomMessages(data: Message): void {
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
			const board: Board = this.app.getBoard() as Board;

			if (!board) {
				return;
			}

			const snapshot = exportBoardSnapshot(board, Quality.MEDIUM);

			window.parent.postMessage(
				{
					pattern: "makeSnapshot",
					payload: JSON.stringify(snapshot),
				},
				"*",
			);
		}

		if (data.pattern === "iframeEvent") {
			if (isIframe()) {
				const keyboardEvent = new KeyboardEvent(
					data.payload.event.eventType,
					{ ...data.payload.event.eventData },
				);
				window.self.dispatchEvent(keyboardEvent);
			}
		}
	}
}
