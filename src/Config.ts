const isSnapshotInIframe =
  typeof window !== "undefined" &&
  window.parent &&
  window.parent !== window &&
  window.parent.location.href.includes("/snapshots/");

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
  return `${PROTOCOL}//${HOST}/api/v1${path}`;
}

export function getPublicUrl(path?: string): string {
  if (!path) {
    path = "";
  }
  return `${PROTOCOL}//${HOST}${path}`;
}

export function getWebsocketUrl(): string {
  return `${PROTOCOL === "https:" ? "wss" : "ws"}://${HOST}/ws`;
}
export function getApiUrlV2(path?: string): string {
  if (!path) {
    path = "";
  }
  return `${PROTOCOL}//${HOST}/api/v2${path}`;
}
