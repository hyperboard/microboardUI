type Params = {
	container: HTMLElement;
	baseUrl: string;
	boardId: string;
	userToken: string;
	width?: string;
	height?: string;
};

interface WhiteboardModule {
	render(params: Params): Promise<void>;
	dispose(): Promise<void>;
	setAuthToken(accessToken: string, refreshToken: string): void;
}
export class WhiteboardModuleView implements WhiteboardModule {
	private iframe: HTMLIFrameElement | undefined;

	render(params: Params): Promise<void> {
		return new Promise(resolve => {
			const { container, baseUrl, boardId } = params;
			this.iframe = document.createElement("iframe");
			this.iframe.src = `${baseUrl}/${boardId}`;
			this.iframe.id = "iframe";
			this.iframe.width = params.width || "100%";
			this.iframe.height = params.height || "100%";
			this.iframe.sandbox.add("allow-same-origin", "allow-scripts");

			this.iframe.onload = () => {
				document.addEventListener("keydown", (event: KeyboardEvent) => {
					console.log("keydown in iframe: " + event.key);
				});

				resolve();
			};

			container.appendChild(this.iframe);
		});
	}

	setAuthToken(accessToken: string, refreshToken: string): void {
		const message = {
			pattern: "updateUserToken",
			payload: {
				accessToken,
				refreshToken,
			},
		};
		console.log("Set auth token:", message);
		this.iframe?.contentWindow?.postMessage(message, "*");
	}

	async dispose(): Promise<void> {
		if (this.iframe) {
			const container = this.iframe.parentNode;
			if (container) {
				container.removeChild(this.iframe);
			}
		}
	}
}
