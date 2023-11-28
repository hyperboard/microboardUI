export function getApiUrl(path?: string): string {
	if (!path) {
		path = "";
	}
	return `${location.protocol}//${location.host}/api/v1${path}`;
}

export function getWebsocketUrl(): string {
	return `${location.protocol === "https:" ? "wss" : "ws"}://${
		location.host
	}/ws`;
}
