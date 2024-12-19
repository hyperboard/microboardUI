export function getApiUrl(path?: string): string {
	if (!path) {
		path = "";
	}
	return `${location.protocol}//${location.host}/api/v1${path}`;
}

export function getPublicUrl(path?: string): string {
	if (!path) {
		path = "";
	}
	return `${location.protocol}//${location.host}${path}`;
}

export function getWebsocketUrl(): string {
	return `${location.protocol === "https:" ? "wss" : "ws"}://${
		location.host
	}/ws`;
}

export function getApiUrlV2(path?: string): string {
	if (!path) {
		path = "";
	}
	return `${location.protocol}//${location.host}/api/v2${path}`;
}
