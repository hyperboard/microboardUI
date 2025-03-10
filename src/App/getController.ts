import { Board } from "Board";
import { ImageItem, ImageItemData } from "Board/Items/Image";
import { checkHotkeys, isControlCharacter } from "Board/Keyboard";
import { Clipboard } from "./Clipboard";
import { createWheel } from "./Wheel/Wheel";
import { isSafari } from "./isSafari";
import { prepareImage } from "Board/Items/Image/ImageHelpers";
import { HotkeysMap } from "Board/Keyboard/types";
import { PRESENCE_CURSOR_THROTTLE } from "Board/Presence/Presence";
import { pasteTextToTheBoard, tryToPasteAsItemOrReturnText } from "./Paste";
import { throttle } from "shared/lib/throttle";
import { MemoryLogger } from "shared/Logger";

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

function getEventDataAsString(event: Event): string {
	let eventData = "";
	const keys = Object.keys(event).concat(
		Object.getOwnPropertyNames(Object.getPrototypeOf(event)),
	);
	keys.forEach(key => {
		try {
			const value = event[key as keyof Event];
			if (typeof value !== "function") {
				eventData += `${key}: ${value}, `;
			}
		} catch (error) {
			eventData += `${key}: [unavailable], `;
		}
	});
	return eventData;
}

export function getController(
	getBoard: () => Board,
	clipboard: Clipboard,
	isLoggedIn: () => boolean,
): Controller {
	let lastEventTime = 0;
	let isTouchpad = false;
	let isItemUnderPointer = false;
	function onWheel(event: WheelEvent): void {
		event.preventDefault();
		event.stopPropagation();
		const board = getBoard();
		const wheel = createWheel(event);
		if (!board) {
			return;
		}
		board.camera.unsubscribeFromItem();
		if (wheel.isIgnore()) {
			return;
		}
		// if (wheel.isProbablyMouseWheel()) {
		// 	console.log("wheel", wheel.getWheelScaleMultiplier());
		// 	board.camera.zoomRelativeToPointerBy(
		// 		wheel.getWheelScaleMultiplier(),
		// 	);
		// } else if (wheel.isTouchpadPinch()) {
		// 	console.log("touchpad", wheel.getTouchpadPinchMultiplier());
		// 	board.camera.zoomRelativeToPointerBy(
		// 		wheel.getTouchpadPinchMultiplier(),
		// 	);
		// } else {
		// 	console.log("translate");
		// 	const scale = board.camera.getScale();
		// 	board.camera.translateBy(
		// 		wheel.getTouchpadPanDeltaX() / scale,
		// 		wheel.getTouchpadPanDeltaY() / scale,
		// 	);
		// }

		const currentTime = Date.now();
		const deltaTime = currentTime - lastEventTime;
		lastEventTime = currentTime;

		if (deltaTime > 200 && !wheel.isProbablyMouseWheel()) {
			return;
		}

		const scale = board.camera.getScale();
		const eventJson = getEventDataAsString(event);

		MemoryLogger.setContext("WheelHandler");
		if (event.ctrlKey) {
			MemoryLogger.log(
				`Delta: ${deltaTime}; Touchpad pinch detected: ${eventJson}`,
			);
			board.camera.zoomRelativeToPointerBy(
				wheel.getTouchpadPinchMultiplier(),
			);
		} else if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
			const isSmallDelta = Math.abs(event.deltaY) < 10;
			isTouchpad = isSmallDelta
				? deltaTime < 100
				: deltaTime <= 100 && isTouchpad;

			if (isTouchpad) {
				MemoryLogger.log(
					`Delta: ${deltaTime}; Is small delta: ${isSmallDelta}; Touchpad scroll detected: ${eventJson}`,
				);
				board.camera.translateBy(
					wheel.getTouchpadPanDeltaX() / scale,
					wheel.getTouchpadPanDeltaY() / scale,
				);
			} else {
				MemoryLogger.log(
					`Delta: ${deltaTime}; Is small delta: ${isSmallDelta}; Mouse wheel detected: ${eventJson}`,
				);
				board.camera.zoomRelativeToPointerBy(
					wheel.getWheelScaleMultiplier(),
				);
			}
		}
	}

	function onKeyDown(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board || !board.events) {
			return;
		}

		board.camera.unsubscribeFromItem();
		board.presence.disableTracking();

		const context = board.selection.getContext();
		const editModeHotkeys: HotkeysMap = {
			select: {
				cb: () => {
					if (board.tools.getNavigate()) {
						board.tools.select(true);
					} else {
						board.tools.navigate();
					}
				},
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
			eraser: {
				cb: () => board.tools.eraser(true),
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
				/* TODO uncomment when dropflow can text-decoration, prevents default to prevent slate from adding same style */
				cb: () => board.selection.setFontStyle("line-through"),
				selectionContext: [
					"EditTextUnderPointer",
					"EditUnderPointer",
					"SelectByRect",
				],
			},
			textUnderline: {
				/* TODO uncomment when dropflow can text-decoration, prevents default to prevent slate from adding same style */
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
			cancel: { cb: () => board.tools.cancel(), preventDefault: false },
			confirm: () => board.tools.confirm(),
			zoomIn: () => board.camera.zoomInToViewCenter(),
			zoomOut: () => board.camera.zoomOutFromViewCenter(),
			zoomDefault: () => board.camera.zoomToViewCenter(1),
			frameNavigationNext: () => board.tools.frameNavigation("next"),
			frameNavigationPrev: () => board.tools.frameNavigation("prev"),
			navigateMode: {
				cb: () =>
					board.tools.setNavigateMode(board.keyboard.isSpacePressed),
				selectionContext: ["None", "EditUnderPointer", "SelectByRect"],
			},
		};
		const viewModeHotkeys = {
			zoomIn: () => board.camera.zoomInToViewCenter(),
			zoomOut: () => board.camera.zoomOutFromViewCenter(),
			zoomDefault: () => board.camera.zoomToViewCenter(1),
		};

		const single = board.selection.items.getSingle();
		const shouldRemoveConnector =
			event.key === "Escape" &&
			single &&
			single.itemType === "Connector" &&
			board.selection.showQuickAddPanel;
		if (shouldRemoveConnector) {
			board.remove(single);
			return;
		}

		const isHotkeyTriggered = checkHotkeys(
			board.getInterfaceType() === "edit"
				? editModeHotkeys
				: viewModeHotkeys,
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

		const editModeHotkeys: HotkeysMap = {
			navigateMode: () => board.tools.exitNavigateMode(),
		};

		if (board.getInterfaceType() === "edit") {
			checkHotkeys(editModeHotkeys, event, board);
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
	let isPinching = false;

	function onPointerDown(event: PointerEvent): boolean {
		pointerDownTime = Date.now();
		const board = getBoard();
		if (!board) {
			return false;
		}
		board.camera.unsubscribeFromItem();
		board.isBoardMenuOpen = false;
		const { tools, camera, selection } = board;
		const transformerTool = selection.tool;
		camera.saveDownEvent(event);
		if (camera.isTwoPointers()) {
			isPinching = true;
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

	const sendPresencePointer = throttle((board: Board, timestamp: number) => {
		const pointer = board.pointer;
		board.presence.emit({
			method: "PointerMove",
			position: { x: pointer.point.x, y: pointer.point.y },
			timestamp,
		});
	}, PRESENCE_CURSOR_THROTTLE);

	function onPointerMove(event: PointerEvent): boolean {
		const currentTime = Date.now();
		if (currentTime - pointerDownTime < pointerMoveDelay) {
			return false;
		}
		const board = getBoard();
		if (!board) {
			return false;
		}

		sendPresencePointer(board, currentTime);
		const { camera, tools } = board;

		camera.updateDownEvent(event);
		if (camera.isTwoPointers()) {
			isPinching = true;
			const pinchCenter = camera.getPinchCenter();
			const scale = camera.getPinchScale();
			const delta = camera.getPanDelta();
			camera.translateBy(delta.x, delta.y);
			camera.zoomRelativeToPointBy(
				scale,
				pinchCenter.x,
				pinchCenter.y,
				0,
			);
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
		const itemsUnderPointer = board.items.getUnderPointer();
		if (itemsUnderPointer.length) {
			isItemUnderPointer = true;
			board.pointer.subject.publish(board.pointer);
		} else if (isItemUnderPointer) {
			isItemUnderPointer = false;
			board.pointer.subject.publish(board.pointer);
		}
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
	let pinchingTimeout: NodeJS.Timeout | null = null;

	function onPointerUp(event: PointerEvent): boolean {
		const board = getBoard();
		if (!board) {
			return false;
		}
		board.presence.emit({
			method: "CancelDrawSelect",
			timestamp: Date.now(),
		});
		board.isBoardMenuOpen = false;
		const { tools, selection, camera } = board;
		camera.removeDownEvent(event);
		if (isSafari()) {
			if (touchtime === 0) {
				touchtime = new Date().getTime();
			} else {
				if (new Date().getTime() - touchtime < delay && !isPinching) {
					triggerDoubleClick(event);
					touchtime = 0;
				} else {
					touchtime = new Date().getTime();
				}
			}
		}

		if (pinchingTimeout) {
			clearTimeout(pinchingTimeout);
		}

		pinchingTimeout = setTimeout(() => {
			isPinching = false;
			pinchingTimeout = null;
		}, delay);

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
			board.presence.disableTracking();
			switch (event.button) {
				case 0:
					return tools.leftButtonUp();
				case 1:
					return tools.middleButtonUp();
				case 2:
					board.isBoardMenuOpen = true;
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
		board.isBoardMenuOpen = false;
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

		const aiInputRegex = /^AIInput-module__aiInput/;
		if (
			event?.target instanceof HTMLElement &&
			aiInputRegex.test(event.target.className)
		) {
			clipboard.set(event);
			return;
		}

		const data = board.selection.copy();
		if ("imageElement" in data) {
			copyImage(event, board, clipboard, data);
		} else {
			const text = JSON.stringify(data);
			event.clipboardData?.setData("text/plain", text);
			clipboard.set(data);
			event.preventDefault();
		}
	}

	async function onPaste(event: ClipboardEvent): Promise<void> {
		const board = getBoard();
		if (!board) {
			return;
		}
		board.camera.unsubscribeFromItem();

		const data = await tryToPasteAsItemOrReturnText(
			event,
			board,
			isLoggedIn(),
		);

		if (data) {
			pasteTextToTheBoard(board, data);
		}
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
					const image = new ImageItem(imageData, board, undefined);
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
		onPointerMove,
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

async function copyImage(
	event: ClipboardEvent,
	board: Board,
	clipboard: Clipboard,
	data: { imageElement: HTMLImageElement; imageData: ImageItemData },
) {
	try {
		const { imageElement, imageData } = data;
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width = imageElement.naturalWidth;
		canvas.height = imageElement.naturalHeight;
		ctx?.drawImage(imageElement, 0, 0);
		const blob = await new Promise<Blob | null>((resolve, reject) => {
			canvas.toBlob(blob => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("No blob"));
				}
			});
		});

		if (!blob) {
			throw new Error("No blob");
		}

		const item = new ClipboardItem({ [blob.type]: blob });
		await navigator.clipboard.write([item]);
		const metaBlob = new Blob([JSON.stringify(imageData)], {
			type: "text/plain",
		});

		const clipboardItem = new ClipboardItem({
			"image/png": blob,
			"text/plain": metaBlob,
		});

		await navigator.clipboard.write([clipboardItem]);
		event.preventDefault();
	} catch (err) {
		console.error("error while copying image", err);
		const text = JSON.stringify(board.selection.copy(true));
		event.clipboardData?.setData("text/plain", text);
		clipboard.set(data);
		event.preventDefault();
	}
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

export function postKeyboardEvent(event: KeyboardEvent): void {
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
