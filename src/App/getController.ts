import { Board } from "Board";
import { Mbr } from "Board/Items";
import { ImageItem } from "Board/Items/Image";
import { RichText } from "Board/Items/RichText/RichText";
import { checkHotkeys, isControlCharacter } from "Board/Keyboard";
import { validateItemsMap } from "Board/Validators";
import { Clipboard } from "./Clipboard";
import { createWheel } from "./Wheel/Wheel";
import { isSafari } from "./isSafari";
import { prepareImage } from "Board/Items/Image/ImageHelpers";
import { HotkeysMap } from "Board/Keyboard/types";
import { pasteMiroClipboard } from "../View/ImportMiro/ImportMiroBoards/ImportBoardItem/MiroClipboardTransformer";
import Cookies from "js-cookie";

export interface Controller {
	onWheel: (event: WheelEvent) => void;
	onPointerDown: (event: PointerEvent) => boolean;
	onPointerMove: (event: PointerEvent) => boolean;
	onPointerUp: (event: PointerEvent) => boolean;
	onPointerLeave: (event: PointerEvent) => void;
	onPointerCancel: (event: PointerEvent) => void;
	onPointerOut: (event: PointerEvent) => void;
	onKeyDown: (event: KeyboardEvent) => void;
	onKeyUp: (event: KeyboardEvent) => void;
	onClick: (event: MouseEvent) => boolean;
	onResize: () => void;
	onContextMenu: (event: MouseEvent) => void;
	onCopy: (event: ClipboardEvent) => void;
	onPaste: (event: ClipboardEvent) => void;
	onDrop: (event: DragEvent) => void;
}

export function getController(
	getBoard: () => Board,
	clipboard: Clipboard,
): Controller {
	function onWheel(event: WheelEvent): void {
		event.preventDefault();
		event.stopPropagation();
		const board = getBoard();
		const wheel = createWheel(event);
		if (!board) {
			return;
		}
		if (wheel.isIgnore()) {
			return;
		}
		if (wheel.isProbablyMouseWheel()) {
			board.camera.zoomRelativeToPointerBy(
				wheel.getWheelScaleMultiplier(),
			);
		} else if (wheel.isTouchpadPinch()) {
			board.camera.zoomRelativeToPointerBy(
				wheel.getTouchpadPinchMultiplier(),
			);
		} else {
			const scale = board.camera.getScale();
			board.camera.translateBy(
				wheel.getTouchpadPanDeltaX() / scale,
				wheel.getTouchpadPanDeltaY() / scale,
			);
		}
	}

	function onKeyDown(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board || !board.events) {
			return;
		}

		const context = board.selection.getContext();
		const editModeHotkeys: HotkeysMap = {
			select: {
				cb: () => board.tools.select(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			text: {
				cb: () => board.tools.addText(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			sticker: {
				cb: () => board.tools.addSticker(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			shape: {
				cb: () => board.tools.addShape(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			connector: {
				cb: () => board.tools.addConnector(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			pen: {
				cb: () => board.tools.addDrawing(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			frame: {
				cb: () => board.tools.addFrame(true),
				selectionContext: ["SelectUnderPointer", "None"],
			},
			duplicate: {
				cb: () => board.selection.duplicate(),
				selectionContext: [
					"EditUnderPointer",
					"SelectByRect",
					"EditTextUnderPointer",
				],
			},
			bringToFront: {
				cb: () => board.selection.bringToFront(),
				selectionContext: [
					"EditUnderPointer",
					"SelectByRect",
					"EditTextUnderPointer",
				],
			},
			sendToBack: {
				cb: () => board.selection.sendToBack(),
				selectionContext: [
					"EditUnderPointer",
					"SelectByRect",
					"EditTextUnderPointer",
				],
			},
			delete: {
				cb: () => board.selection.removeFromBoard(),
				selectionContext: ["EditUnderPointer", "SelectByRect"],
			},
			textBold: {
				cb: () => board.selection.setFontStyle("bold"),
				selectionContext: [
					"EditTextUnderPointer",
					"EditUnderPointer",
					"SelectByRect",
				],
			},
			textItalic: {
				cb: () => board.selection.setFontStyle("italic"),
				selectionContext: [
					"EditTextUnderPointer",
					"EditUnderPointer",
					"SelectByRect",
				],
			},
			textStrike: {
				cb: () => board.selection.setFontStyle("line-through"),
				selectionContext: [
					"EditTextUnderPointer",
					"EditUnderPointer",
					"SelectByRect",
				],
			},
			textUnderline: {
				cb: () => board.selection.setFontStyle("underline"),
				selectionContext: [
					"EditTextUnderPointer",
					"EditUnderPointer",
					"SelectByRect",
				],
			},
			selectAll: {
				cb: () => board.selection.addAll(),
				selectionContext: ["None", "EditUnderPointer", "SelectByRect"],
			},
			undo: () => board.events?.undo(),
			redo: () => board.events?.redo(),
			cancel: () => board.tools.cancel(),
			confirm: () => board.tools.confirm(),
			zoomIn: () => board.camera.zoomInToViewCenter(),
			zoomOut: () => board.camera.zoomOutFromViewCenter(),
			zoomDefault: () => board.camera.zoomToViewCenter(1),
		};
		const viewModeHotkeys = {
			zoomIn: () => board.camera.zoomInToViewCenter(),
			zoomOut: () => board.camera.zoomOutFromViewCenter(),
			zoomDefault: () => board.camera.zoomToViewCenter(1),
		};
		const isHotkeyTriggered = checkHotkeys(
			board.interfaceType === "edit" ? editModeHotkeys : viewModeHotkeys,
			event,
			board,
		);

		const isSingleItemInSelection = board.selection.items.isSingle();

		const isTextEditStarted =
			!isHotkeyTriggered &&
			context !== "EditTextUnderPointer" &&
			isSingleItemInSelection &&
			!(event.ctrlKey || event.metaKey || event.altKey) &&
			!isControlCharacter(event.key);
		if (isTextEditStarted) {
			board.selection.editText(event.key);
		}

		board.keyboard.keyDown(event);
		if (!board.selection.tool.keyDown(board.keyboard.down)) {
			board.tools.keyDown(board.keyboard.down);
		}
		if (!isTextEditStarted) {
			postKeyboardEvent(event);
		}
	}

	function onKeyUp(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}

		board.keyboard.keyUp(event);
		if (!board.selection.tool.keyUp(board.keyboard.up)) {
			board.tools.keyUp(board.keyboard.up);
		}

		postKeyboardEvent(event);
	}

	function onResize(): void {
		const board = getBoard();
		if (board) {
			board.camera.onWindowResize();
		}
	}

	function onContextMenu(event: MouseEvent): void {
		const target = event.target;
		if (target instanceof HTMLElement) {
			if (target.classList.contains("NoContextMenu")) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	}

	let pointerDownTime = 0;
	const pointerMoveDelay = 100;

	function onPointerDown(event: PointerEvent): boolean {
		pointerDownTime = Date.now();
		const board = getBoard();
		if (!board) {
			return false;
		}

		const { tools, camera, selection } = board;
		const transformerTool = selection.tool;
		camera.saveDownEvent(event);
		if (camera.isTwoPointers()) {
			return false;
		}
		camera.pointTo(event.pageX, event.pageY);
		const isSelect = tools.getSelect() !== undefined;
		if (isSelect) {
			switch (event.button) {
				case 0:
					return (
						transformerTool.leftButtonDown() ||
						tools.leftButtonDown()
					);
				case 1:
					return (
						transformerTool.middleButtonDown() ||
						tools.middleButtonDown()
					);
				case 2:
					return (
						transformerTool.rightButtonDown() ||
						tools.rightButtonDown()
					);
				default:
					return (
						transformerTool.leftButtonDown() ||
						tools.leftButtonDown()
					);
			}
		} else {
			switch (event.button) {
				case 0:
					return tools.leftButtonDown();
				case 1:
					return tools.middleButtonDown();
				case 2:
					return tools.rightButtonDown();
				default:
					return tools.leftButtonDown();
			}
		}
	}

	function onPointerMove(event: PointerEvent): boolean {
		const currentTime = Date.now();
		if (currentTime - pointerDownTime < pointerMoveDelay) {
			return false;
		}
		const board = getBoard();
		if (!board) {
			return false;
		}

		const { camera, tools } = board;

		camera.updateDownEvent(event);
		if (camera.isTwoPointers()) {
			const pinchCenter = camera.getPinchCenter();
			const scale = camera.getPinchScale();
			const delta = camera.getPanDelta();
			camera.translateBy(delta.x, delta.y);
			camera.zoomRelativeToPointBy(scale, pinchCenter.x, pinchCenter.y);
			camera.updatePositions();
			camera.updateDistance();
			tools.leftButtonUp();
			return false;
		}

		const selection = board.selection;
		const oldPoint = board.pointer.point.copy();
		camera.pointTo(event.pageX, event.pageY);
		const newPoint = board.pointer.point.copy();
		const dx = newPoint.x - oldPoint.x;
		const dy = newPoint.y - oldPoint.y;
		const isSelect = tools.getSelect() !== undefined;
		if (isSelect) {
			return (
				selection.tool.pointerMoveBy(dx, dy) ||
				tools.pointerMoveBy(dx, dy)
			);
		} else {
			return tools.pointerMoveBy(dx, dy);
		}
	}

	let touchtime = 0;
	const delay = 300;

	function onPointerUp(event: PointerEvent): boolean {
		const board = getBoard();
		if (!board) {
			return false;
		}
		const { tools, selection, camera } = board;
		camera.removeDownEvent(event);
		if (isSafari()) {
			if (touchtime === 0) {
				touchtime = new Date().getTime();
			} else {
				if (new Date().getTime() - touchtime < delay) {
					triggerDoubleClick(event);
					touchtime = 0;
				} else {
					touchtime = new Date().getTime();
				}
			}
		}
		const transformerTool = selection.tool;
		const isSelect = tools.getSelect() !== undefined;
		if (isSelect) {
			switch (event.button) {
				case 0:
					return (
						transformerTool.leftButtonUp() || tools.leftButtonUp()
					);
				case 1:
					return (
						transformerTool.middleButtonUp() ||
						tools.middleButtonUp()
					);
				case 2:
					return (
						transformerTool.rightButtonUp() || tools.rightButtonUp()
					);
				default:
					return (
						transformerTool.leftButtonUp() || tools.leftButtonUp()
					);
			}
		} else {
			switch (event.button) {
				case 0:
					return tools.leftButtonUp();
				case 1:
					return tools.middleButtonUp();
				case 2:
					return tools.rightButtonUp();
				default:
					return tools.leftButtonUp();
			}
		}
	}

	function onClick(event: MouseEvent): boolean {
		if (event.detail === 2) {
			triggerDoubleClick(event);
		}
		return false;
	}

	function triggerDoubleClick(event: PointerEvent | MouseEvent): boolean {
		const board = getBoard();
		if (!board) {
			return false;
		}
		const { tools, selection } = board;
		const transformerTool = selection.tool;
		switch (event.button) {
			case 0:
				return (
					transformerTool.leftButtonDouble() ||
					tools.leftButtonDouble()
				);
			case 1:
				return (
					transformerTool.middleButtonDouble() ||
					tools.middleButtonDouble()
				);
			case 2:
				return (
					transformerTool.rightButtonDouble() ||
					tools.rightButtonDouble()
				);
			default:
				return false;
		}
	}

	function onPointerLeave(event: PointerEvent): void {
		if (isPointerOutsideWindow(event)) {
			onPointerUp(event);
		}
	}

	function onPointerCancel(event: PointerEvent): void {
		if (isPointerOutsideWindow(event)) {
			onPointerUp(event);
		}
	}

	function onPointerOut(event: PointerEvent): void {
		if (isPointerOutsideWindow(event)) {
			onPointerUp(event);
		}
	}

	function isPointerOutsideWindow(event: PointerEvent): boolean {
		return (
			event.clientX <= 0 ||
			event.clientY <= 0 ||
			event.clientX >= window.innerWidth ||
			event.clientY >= window.innerHeight
		);
	}

	function onCopy(event: ClipboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		if (board.selection.getContext() === "EditTextUnderPointer") {
			clipboard.set(null);
			return;
		}
		const data = board.selection.copy();
		const text = JSON.stringify(data);
		event.clipboardData?.setData("text/plain", text);
		clipboard.set(data);
		event.preventDefault();
	}

	function onPaste(event: ClipboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		if (board.selection.getContext() === "EditTextUnderPointer") {
			const text = event.clipboardData?.getData("text/plain") || "";
			try {
				const data = JSON.parse(text);
				const isDataValid = validateItemsMap(data);
				if (isDataValid) {
					board.paste(data);
					event.preventDefault();
					event.stopPropagation();
					return;
				} else {
					throw new Error();
				}
			} catch (error) {}
			return;
		}

		let didAttempImage = false;
		const items = event.clipboardData?.items;
		// @ts-expect-error iterates just fine
		for (const item of items) {
			if (item.type.indexOf("image") !== -1) {
				didAttempImage = true;
				const file = item.getAsFile();
				const reader = new FileReader();
				reader.onload = event => {
					prepareImage(event.target?.result)
						.then(imageData => {
							const image = new ImageItem(imageData);
							image.transformation.translateTo(
								board.pointer.point.x,
								board.pointer.point.y,
							);
							board.add(image);
						})
						.catch(er => {
							console.error("Could not create image:", er);
							// TODO notification
						});
				};

				reader.readAsDataURL(file);
			}
		}
		if (didAttempImage) {
			return;
		}

		function adjustBytes(byteArray: Uint8Array, adjustment: number): void {
			for (let i = 0; i < byteArray.length; i++) {
				const byte = byteArray[i];
				if (byte < 256) {
					byteArray[i] = (byte + adjustment) % 256;
				}
			}
		}

		function getVersionSuffix(version: number): string {
			return version > 0 ? `-v${version}` : "";
		}

		function decodeData(encodedData: string): string | null {
			return (function (
				encodedString: string,
				adjustment: number,
			): string {
				const decodedBase64 = atob(encodedString);
				const byteArray = new Uint8Array(decodedBase64.length);

				for (let i = 0; i < byteArray.length; i++) {
					byteArray[i] = decodedBase64.charCodeAt(i);
				}

				adjustBytes(byteArray, 197);
				return new TextDecoder().decode(byteArray);
			})(
				(function (data: string, version = 1): string | null {
					const versionSuffix = getVersionSuffix(version);
					const regex = new RegExp(
						`<--\\(miro-data${versionSuffix}\\)(.*)(\\(\\/miro-data${versionSuffix}\\)-->)`,
						"gi",
					);
					const match = regex.exec(data);
					return match ? match[1] : null;
				})(encodedData) || encodedData,
				0,
			);
		}

		const html = event?.clipboardData?.getData("text/html");
		if (html) {
			try {
				const decoded = decodeData(html);

				if (decoded !== null) {
					const miroData = JSON.parse(decoded);

					const userToken = Cookies.get("accessToken");
					if (!userToken && miroData !== null) {
						window.location.href = "/auth/sign-in";
					}
					pasteMiroClipboard(board, miroData || []);

					return;
				}
			} catch (err) {
				console.error(err);
				// TODO: notification/ toast?
			}
		}

		const text = event?.clipboardData?.getData("text/plain") || "";
		try {
			const data = JSON.parse(text);
			const isDataValid = validateItemsMap(data);
			if (isDataValid) {
				board.paste(data);
			} else {
				throw new Error();
			}
		} catch (error) {
			pasteTextToTheBoard(board, text);
		}

		event.preventDefault();
	}

	function onDrop(event): void {
		event.preventDefault();
		const board = getBoard();
		if (!board) {
			return;
		}

		const file = event.dataTransfer.files[0];
		const reader = new FileReader();

		reader.onload = function (event) {
			prepareImage(event.target?.result)
				.then(imageData => {
					const image = new ImageItem(imageData);
					image.transformation.translateTo(
						board.pointer.point.x,
						board.pointer.point.y,
					);
					board.add(image);
				})
				.catch(er => {
					console.error("Could not create image:", er);
					// TODO notification
				});
		};

		reader.readAsDataURL(file);
	}

	return {
		onWheel,
		onPointerDown,
		onPointerMove: throttle(onPointerMove, 32), // 32 мс ~ 30 fps,
		onPointerUp,
		onPointerLeave,
		onPointerCancel,
		onPointerOut,
		onKeyDown,
		onKeyUp,
		onClick,
		onResize,
		onContextMenu,
		onCopy,
		onPaste,
		onDrop,
	};
}

function isTextInput(element): boolean {
	try {
		const tagName = element.tagName.toLowerCase();

		return (
			tagName === "input" ||
			tagName === "textarea" ||
			element.isContentEditable
		);
	} catch (_) {
		return false;
	}
}

function pasteTextToTheBoard(board: Board, text: string): void {
	const richText = new RichText(new Mbr());
	richText.transformation.translateTo(
		board.pointer.point.x,
		board.pointer.point.y,
	);
	richText.transformation.scaleBy(1, 1);
	richText.editor.setMaxWidth(600);
	richText.editor.setSelectionHorisontalAlignment("left");
	richText.insideOf = richText.itemType;
	richText.editor.insertText(text);
	board.add(richText);
}

function postKeyboardEvent(event: KeyboardEvent): void {
	if (!isTextInput(event.target)) {
		window.parent.postMessage(serializeKeyboardEvent(event), "*");
	}
}

interface SerializedKeyboardEvent {
	type: string;
	eventType: string;
	eventData: {
		key: string;
		code: string;
		ctrlKey: boolean;
		shiftKey: boolean;
		altKey: boolean;
		metaKey: boolean;
		repeat: boolean;
		bubbles: boolean;
		target: string;
		location: number;
		isComposing: boolean;
		charCode: number;
		keyCode: number;
		which: number;
	};
}

function serializeKeyboardEvent(event: KeyboardEvent): SerializedKeyboardEvent {
	return {
		type: "keyboardEvent",
		eventType: event.type,
		eventData: {
			key: event.key,
			code: event.code,
			ctrlKey: event.ctrlKey,
			shiftKey: event.shiftKey,
			altKey: event.altKey,
			metaKey: event.metaKey,
			repeat: event.repeat,
			bubbles: event.bubbles,
			target: "whiteboard",
			location: event.location,
			isComposing: event.isComposing,
			charCode: event.charCode,
			keyCode: event.keyCode,
			which: event.which,
		},
	};
}

// Декоратор для троттлинга событий движения указателя
function throttle<T extends (event: PointerEvent, ...args: any[]) => any>(
	func: T,
	limit: number,
): T {
	let lastCallTime = 0;
	let lastEvent: PointerEvent | null = null;

	return function (this: any, ...args: Parameters<T>): ReturnType<T> {
		const currentTime = Date.now();
		const event = args[0] as PointerEvent;

		// Обновляем lastEvent каждый раз, когда получаем новое событие
		lastEvent = event;

		if (currentTime - lastCallTime >= limit) {
			lastCallTime = currentTime;
			const result = func.apply(this, [
				lastEvent,
				...args.slice(1),
			] as Parameters<T>);
			lastEvent = null;
			return result;
		}

		return undefined as ReturnType<T>;
	} as T;
}
