import { conf } from "microboard-temp";
export const frontConf = {
  apiURL: undefined as string | undefined,
  wsURL: undefined as string | undefined,
};

window.MICROBOARD_CONFIG = conf;
window.MICROBOARD_FRONT_CONFIG = {
  ...frontConf,
  ...window.MICROBOARD_FRONT_CONFIG,
};

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

function normalizeApiPath(path?: string): string {
  return path ? (path.startsWith("/") ? path : `/${path}`) : "";
}

function getConfiguredApiBase(version: "v1" | "v2"): string | undefined {
  const configuredApiUrl = window.MICROBOARD_FRONT_CONFIG.apiURL;

  if (!configuredApiUrl) {
    return undefined;
  }

  if (version === "v2") {
    return configuredApiUrl.replace(/\/api\/v1\/?$/, "/api/v2");
  }

  return configuredApiUrl;
}

export function getApiUrl(path?: string): string {
  const normalizedPath = normalizeApiPath(path);
  const configuredApiBase = getConfiguredApiBase("v1");

  if (configuredApiBase) {
    return `${configuredApiBase}${normalizedPath}`;
  }
  return `${PROTOCOL}//${HOST}/api/v1${normalizedPath}`;
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
  const normalizedPath = normalizeApiPath(path);
  const configuredApiBase = getConfiguredApiBase("v2");

  if (configuredApiBase) {
    return `${configuredApiBase}${normalizedPath}`;
  }
  return `${PROTOCOL}//${HOST}/api/v2${normalizedPath}`;
}
