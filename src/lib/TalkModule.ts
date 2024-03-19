import Cookies from "js-cookie";
import { isIframe } from "./isIframe";

type MessagePattern = "setTalkAuthToken";

interface SetAuthTokenData {
    accessToken: string;
    refreshToken: string;
}

type DataTypes = SetAuthTokenData;

interface Message<T = unknown>{
	pattern: MessagePattern;
	payload: T;
}

interface TalkModuleSettings {
  origins: string[];
}

export class TalkModule {
  private origins: string[];
  constructor (settings?: TalkModuleSettings) {
    this.origins = settings?.origins || [];
    this.setEventListeners();
  }

  setEventListeners(): void {
    // if (!isIframe()) { return; }
    window.addEventListener("message", (event: MessageEvent<Message<DataTypes>>) => {
      console.log("event: ", event.data.pattern);
      // if (event.origin !== "https://example-talk.com") {
      // 	return;
      // }
      if (event.data.pattern === "setTalkAuthToken") {
        Cookies.set("accessToken_talk", event.data.payload.accessToken , { secure: false });
        Cookies.set("refreshToken_talk", event.data.payload.refreshToken, { secure: false });
      }
    }, false);
  }
}