import {
	RichText,
	isEditInProcess,
	toggleEdit,
} from "Board/Items/RichText/RichText";
import { isNotControlCharacter } from "View/isNotControlCharacter";
import { Wheel } from "./Wheel/Wheel";
import { Board } from "Board";
import { Mbr } from "Board/Items";
import { ImageItem } from "Board/Items/Image";
import { validateItemsMap, validateRichTextData } from "Board/Validators";
import { isSafari } from "./isSafari";
import { Clipboard } from "./Clipboard";
import { isIframe } from "lib/isIframe";

export function getController(getBoard: () => Board) {
	const isMouse = true;
	const isTrackpad = true;

	const clipboard = new Clipboard();

	function onWheel(event: WheelEvent): void {
		event.preventDefault();
		event.stopPropagation();
		const board = getBoard();
		const wheel = new Wheel(event);
		if (!board) {
			return;
		}
		if (isMouse && isTrackpad) {
			if (wheel.isProbablyMouseWheel()) {
				if (!wheel.isIgnore()) {
					board.camera.zoomRelativeToPointerBy(
						wheel.getWheelScaleMultiplier(),
					);
				}
			} else if (wheel.isTouchpadPinch()) {
				if (!wheel.isIgnore()) {
					board.camera.zoomRelativeToPointerBy(
						wheel.getTouchpadPinchMultiplier(),
					);
				}
			} else {
				if (!wheel.isIgnore()) {
					const scale = board.camera.getScale();
					board.camera.translateBy(
						wheel.getTouchpadPanDeltaX() / scale,
						wheel.getTouchpadPanDeltaY() / scale,
					);
				}
			}
		} else if (isMouse) {
			if (!wheel.isIgnore()) {
				board.camera.zoomRelativeToPointerBy(
					wheel.getWheelScaleMultiplier(),
				);
			}
		} else if (isTrackpad) {
			if (wheel.isTouchpadPinch()) {
				if (!wheel.isIgnore()) {
					board.camera.zoomRelativeToPointerBy(
						wheel.getTouchpadPinchMultiplier(),
					);
				}
			} else {
				if (!wheel.isIgnore()) {
					board.camera.translateBy(
						wheel.getTouchpadPanDeltaX(),
						wheel.getTouchpadPanDeltaY(),
					);
				}
			}
		}
	}

	function onKeyDown(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board || !board.events) {
			return;
		}

		if (isEditInProcess()) {
			if ((event.ctrlKey || event.metaKey) && event.code === "KeyV") {
				const data = clipboard.get();
				if (data) {
					const isDataValid = validateItemsMap(data);
					if (isDataValid) {
						/*
						const keys = Object.keys(data);
						if (keys.length === 1) {
							const itemData = data[keys[0]];
							if (itemData.itemType === "RichText") {
								clipboard.set(itemData.children);
								return;
							}
						}
						*/
						event.preventDefault();
						board.paste(data);
					}
				}
			}
			return;
		}
		// const key = event.key.toLowerCase();
		const key = event.code;
		board.keyboard.keyDown(event);
		if ((event.ctrlKey || event.metaKey) && key === "KeyZ") {
			if (event.shiftKey) {
				board.events.redo();
			} else {
				board.events.undo();
			}
			return;
		}
		if (
			(event.ctrlKey || event.metaKey) &&
			(key === "KeyC" || key === "KeyV")
		) {
			return;
		}
		if (
			isNotControlCharacter(event.key) &&
			board.selection.items.isSingle()
		) {
			const item = board.selection.items.getSingle();

			if (board.selection.getContext() === "EditTextUnderPointer") {
				board.selection.editText();
				return;
			} else if (
				item &&
				["Shape", "Sticker", "Connector"].indexOf(item.itemType) > -1 &&
				board.selection.getContext() === "EditUnderPointer"
			) {
				board.selection.editText();
				return;
			}
		}

		switch (key) {
			case "KeyV":
				board.tools.select();
				break;
			case "KeyS":
				board.tools.addShape();
				break;
			case "KeyN":
				board.tools.addSticker();
				break;
			case "KeyT":
				board.tools.addText();
				break;
			case "KeyL":
				board.tools.addConnector();
				break;
			case "KeyP":
				board.tools.addDrawing();
				break;
		}
		if (board.selection.getContext() !== "SelectUnderPointer") {
			if (key === "Delete" || key === "Backspace") {
				board.selection.removeFromBoard();
				toggleEdit(false);
			}
		}
		if (!board.selection.tool.keyDown(board.keyboard.down)) {
			board.tools.keyDown(board.keyboard.down);
		}
		postKeyboardEvent(event);
	}

	function onKeyUp(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		const key = event.code;
		if (isEditInProcess()) {
			if (event.ctrlKey) {
				event.preventDefault();
				switch (key) {
					case "KeyB":
						board.selection.setFontStyle(["bold"]);
						console.log("ctrl + b");
						break;
					case "KeyI":
						board.selection.setFontStyle(["italic"]);
						console.log("ctrl + i");
						break;
					case "KeyS":
						board.selection.setFontStyle(["line-through"]);
						console.log("ctrl + s");
						break;
					case "KeyU":
						board.selection.setFontStyle(["underline"]);
						console.log("ctrl + u");
						break;
				}
			}
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

	function onPointerDown(event: PointerEvent): boolean {
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
			/*
			if (camera.isPinch()) {
				const pinchCenter = camera.getPinchCenter();
				const scale = camera.getPinchScale();
				camera.updateDistance();
				camera.zoomRelativeToPointBy(
					scale,
					pinchCenter.x,
					pinchCenter.y,
				);
				tools.leftButtonUp();
				return false;
			} else {
				const delta = camera.getPanDelta();
				camera.updatePositions();
				camera.translateBy(delta.x, delta.y);
				tools.leftButtonUp();
				return false;
			}
			*/
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
		const board = getBoard();
		if (!board) {
			return;
		}
		const { camera } = board;
		camera.removeDownEvent(event);
	}

	function onPointerCancel(event: PointerEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		const { camera } = board;
		camera.removeDownEvent(event);
	}

	function onPointerOut(event: PointerEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		const { camera } = board;
		camera.removeDownEvent(event);
	}

	function onCopy(event: ClipboardEvent): void {
		if (isEditInProcess()) {
			clipboard.set(event.clipboardData?.getData("text/plain"));
			return;
		}
		const board = getBoard();
		if (!board) {
			return;
		}
		const data = board.selection.copy();
		const text = JSON.stringify(data);
		event.clipboardData.setData("text/plain", text);
		clipboard.set(data);
		event.preventDefault();
	}

	function onPaste(event): void {
		if (isEditInProcess()) {
			return;
		}
		const board = getBoard();
		if (!board) {
			return;
		}
		const items = event.clipboardData.items;
		for (const item of items) {
			if (item.type.indexOf("image") !== -1) {
				const file = item.getAsFile();
				const reader = new FileReader();
				reader.onload = event => {
					const image = new ImageItem(event.target?.resut);
					image.transformation.translateTo(
						board.pointer.point.x,
						board.pointer.point.y,
					);
					board.add(image);
				};

				reader.readAsDataURL(file);
			}
		}

		const text = event.clipboardData.getData("text/plain");
		try {
			const data = JSON.parse(text);
			const isDataValid = validateItemsMap(data);
			if (isDataValid) {
				board.paste(data);
			} else {
				throw new Error();
			}
		} catch (error) {
			const richtext = new RichText(new Mbr());
			richtext.transformation.translateTo(
				board.pointer.point.x,
				board.pointer.point.y,
			);
			richtext.editor.editor.children = [
				{
					type: "paragraph",
					children: [
						{
							type: "text",
							text: text,
						},
					],
				},
			];
			const dimensions = richtext.getDimensions();
			if (dimensions.width > board.camera.window.width) {
				richtext.editor.setMaxWidth(board.camera.window.width);
			}
			board.add(richtext);
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
			const image = new ImageItem(event.target?.result);
			image.transformation.translateTo(
				board.pointer.point.x,
				board.pointer.point.y,
			);
			board.add(image);
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

function postKeyboardEvent(event: KeyboardEvent) {
	window.parent.postMessage(serializeKeyboardEvent(event), "*");
}

function serializeKeyboardEvent(event: KeyboardEvent) {
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
