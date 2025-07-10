import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import Cookies from "js-cookie";

type Params = {
	container: HTMLElement;
	baseUrl: string;
	boardId: string;
	width?: string;
	height?: string;
};

interface WhiteboardModule {
	render(params: Params): Promise<void>;
	dispose(): Promise<void>;
	setAuthToken(accessToken: string, refreshToken: string): void;
}

export class WhiteboardModuleView implements WhiteboardModule {
	render(params: Params): Promise<void> {
		return new Promise((resolve, reject) => {
			const { container, baseUrl, boardId } = params;
			const searchParams = new URLSearchParams();
			searchParams.append("external", "true");
			const src = `${baseUrl}/${boardId}${searchParams.toString()}`;
			const iframe = React.createElement("iframe", {
				src,
				style: {
					border: "0px",
					width: params.width || "100%",
					height: params.height || "100%",
				},
				sandbox: "allow-same-origin allow-scripts",
				onLoad: () => {
					resolve();
				},
			});
			ReactDOM.render(iframe, container);
		});
	}
	setAuthToken(accessToken: string, refreshToken: string): void {
		Cookies.set("accessToken", accessToken, {
			secure: true,
			sameSite: "none",
		});
		Cookies.set("refreshToken", refreshToken, {
			secure: true,
			sameSite: "none",
		});
	}
	async dispose(): Promise<void> {
		unmountComponentAtNode(window.root);
	}
}

// const iframeTest = new WhiteboardModuleView();
// iframeTest.render({
//     container: window.root,
//     baseUrl: "/boards",
//     boardId: "13ce0830-cf17-40b6-ad3d-05d0456ed31f"
// })
