/* eslint-disable max-classes-per-file, @typescript-eslint/no-useless-constructor */
class RichTextElement extends HTMLElement {
	constructor() {
		super();
	}
}

class ShapeItemElement extends HTMLElement {
	constructor() {
		super();
	}
}

class StickerElement extends HTMLElement {
	constructor() {
		super();
	}
}

class DrawingElement extends HTMLElement {
	constructor() {
		super();
	}
}

class ConnectorElement extends HTMLElement {
	constructor() {
		super();
	}
}

class FrameItemElement extends HTMLElement {
	constructor() {
		super();
	}
}

class ImageItemElement extends HTMLElement {
	constructor() {
		super();
	}
}

class LinkItemElement extends HTMLElement {
	constructor() {
		super();
	}
}

class AINodeItemElement extends HTMLElement {
	constructor() {
		super();
	}
}

customElements.define("rich-text", RichTextElement);
customElements.define("shape-item", ShapeItemElement);
customElements.define("sticker-item", StickerElement);
customElements.define("drawing-item", DrawingElement);
customElements.define("connector-item", ConnectorElement);
customElements.define("frame-item", FrameItemElement);
customElements.define("image-item", ImageItemElement);
customElements.define("link-item", LinkItemElement);
customElements.define("ainode-item", AINodeItemElement);

document.addEventListener("DOMContentLoaded", () => {
	const button = document.createElement("button");
	button.textContent = "Edit board";
	button.style.position = "fixed";
	button.style.left = "5%";
	button.style.top = "5%";
	button.style.border = "2px solid black";
	document.body.appendChild(button);

	button.onclick = async () => {
		button.disabled = true;
		button.textContent = "Loading...";

		const { createApp } = await import(
			"https://www.unpkg.com/test_package_board@0.0.46/dist/bundle.js"
		);
		const app = createApp();
		window.app = app;
		const stringed = await app.openAndEditFile();

		if (stringed) {
			await app.openBoardFromFile();
			app.getBoard().deserializeHTML(stringed);
			app.localRender("items");
		}

		const response = await fetch(
			"https://www.unpkg.com/test_package_board@0.0.44/dist/bundle.css",
		);
		const cssText = await response.text();
		const styleEl = document.createElement("style");
		styleEl.textContent = cssText;
		document.body.appendChild(styleEl);

		const responseSvg = await fetch(
			"https://www.unpkg.com/test_package_board@0.0.44/dist/sprite.svg",
		);
		const svgText = await responseSvg.text();
		const div = document.createElement("div");
		div.style.display = "none";
		div.id = "sprite";
		div.innerHTML = svgText;
		document.body.appendChild(div);

		button.disabled = false;
		button.textContent = "Edit board";
	};
});
