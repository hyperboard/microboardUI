import Cookies from "js-cookie";
import { isIframe } from "./isIframe";

type MessagePattern = "setTalkAuthToken";

interface SetAuthTokenData {
	accessToken: string;
	refreshToken: string;
}

type DataTypes = SetAuthTokenData;

interface Message<T = unknown> {
	pattern: MessagePattern;
	payload: T;
}

interface TalkModuleSettings {
	origins: string[];
}

export class TalkModule {
	private origins: string[];
	constructor(settings?: TalkModuleSettings) {
		this.origins = settings?.origins || [];
		this.setEventListeners();
	}

	private setEventListeners(): void {
		if (!isIframe()) { return; }
		window.addEventListener(
			"message",
			(event: MessageEvent<Message<DataTypes>>) => {
        // if (!this.allowOrigins(event, this.origins)) {
        //   return;
        // }
        
        if (event.data?.eventType === 'keydown' && isIframe()) {
          const keydownEvent = new KeyboardEvent("keydown", { ...event.data.eventData, isTrusted: true });
          window.dispatchEvent(keydownEvent);
        }

				this.handleCustomMessages(event.data);
			},
			false,
		);
	}

  private allowOrigins(event: MessageEvent<Message<DataTypes>>, origins: string[]): boolean {
    for (const origin of origins) {
      if (event.origin !== origin) {
        return false;
      }
    }
    return true;
  }

  private handleCustomMessages(eventData: Message<DataTypes>): void {
    if (eventData.pattern === "setTalkAuthToken") {
      Cookies.set(
        "accessToken_talk",
        eventData.payload.accessToken,
        { secure: false },
      );
      Cookies.set(
        "refreshToken_talk",
        eventData.payload.refreshToken,
        { secure: false },
      );
    }
  }
}
