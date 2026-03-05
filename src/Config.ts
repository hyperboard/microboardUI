import { conf } from "microboard-temp";
export const frontConf = {
  apiURL: undefined as string | undefined,
  wsURL: undefined as string | undefined,
};

window.MICROBOARD_CONFIG = conf;
window.MICROBOARD_FRONT_CONFIG = frontConf;

const isSnapshotInIframe = false;
// typeof window !== "undefined" &&
// window.parent &&
// window.parent !== window &&
// window.parent.location.href.includes("/snapshots/");

const baseUrl =
  typeof process !== "undefined" && process.env.BASE_URL
    ? process.env.BASE_URL
    : isSnapshotInIframe
      ? `${window.parent.location.protocol}//${window.parent.location.host}`
      : `${location.protocol}//${location.host}`;

const parsedUrl = new URL(baseUrl);

export const PROTOCOL = parsedUrl.protocol;
export const HOST = parsedUrl.host;

export function getApiUrl(path?: string): string {
  if (!path) {
    path = "";
  }
  return `https://api.microboard.io/api/v1${path ? "/" + path : ""}`;
  if (window.MICROBOARD_FRONT_CONFIG.apiURL) {
    return `${window.MICROBOARD_FRONT_CONFIG.apiURL}${path}`;
  }
  return `${PROTOCOL}//${HOST}/api/v1${path}`;
}

export function getPublicUrl(path?: string): string {
  if (!path) {
    path = "";
  }
  return `${PROTOCOL}//${HOST}${path}`;
}

export function getWebsocketUrl(): string {
  if (window.MICROBOARD_FRONT_CONFIG.wsURL) {
    return window.MICROBOARD_FRONT_CONFIG.wsURL;
  }
  return `${PROTOCOL === "https:" ? "wss" : "ws"}://${HOST}/ws`;
}
export function getApiUrlV2(path?: string): string {
  if (!path) {
    path = "";
  }
  if (window.MICROBOARD_FRONT_CONFIG.apiURL) {
    return `${window.MICROBOARD_FRONT_CONFIG.apiURL}${path}`;
  }
  return `${PROTOCOL}//${HOST}/api/v2${path}`;
}
