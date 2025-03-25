const LOCATION =
	typeof location !== "undefined"
		? `${location.protocol}//${location.host}`
		: "http://localhost";

const baseUrl =
	typeof process !== "undefined" && process.env.BASE_URL
		? process.env.BASE_URL
		: LOCATION;

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
