import Cookies from "js-cookie";
import { isIframe } from "./isIframe";

type MessagePattern = "updateUserToken" | "iframeEvent";

interface SetAuthTokenData {
	accessToken: string;
	refreshToken: string;
}

interface KeyboardEventData {
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

interface SetAuthTokenDateType {
  pattern: "updateUserToken";
  payload: SetAuthTokenData;
}

interface KeyboardEventDataType {
  pattern: "iframeEvent";
  payload: KeyboardEventData;
}
type Message = SetAuthTokenDateType | KeyboardEventDataType; 

interface IframeModuleSettings {
	origins: string[];
}

export class IframeModule {
	private origins: string[];
	constructor(settings?: IframeModuleSettings) {
		this.origins = settings?.origins || [];
		this.setEventListeners();
	}

	private setEventListeners(): void {
		if (!isIframe()) { return; }
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

  private allowOrigins(event: MessageEvent<Message>, origins: string[]): boolean {
    for (const origin of origins) {
      if (event.origin !== origin) {
        return false;
      }
    }
    return true;
  }

  private handleCustomMessages(data: Message): void {
    if (data.pattern === "updateUserToken") {
      Cookies.set(
        "mb_accessToken",
        data.payload.accessToken,
        { secure: false },
      );
      Cookies.set(
        "mb_refreshToken",
        data.payload.refreshToken,
        { secure: false },
      );
    }

    if (data.pattern === "iframeEvent") {
      if (data.payload?.event?.eventType === 'keydown' && isIframe()) {
        const keydownEvent = new KeyboardEvent(
          data.payload.event.eventType,
          { ...data.payload.event.eventData});
        window.self.dispatchEvent(keydownEvent);
      }
    }
  }
}
