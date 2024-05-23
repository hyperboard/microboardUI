import { Board } from "Board";
import { Connector, Frame, Mbr, RichTextData, Shape } from "Board/Items";
import { ImageItem } from "Board/Items/Image";
import { isEditInProcess, RichText } from "Board/Items/RichText/RichText";
import { checkHotkeys, isHotkeyPushed } from "Board/Keyboard/hotkeys";
import { Sticker } from "Board/Items/Sticker";
import { validateItemsMap } from "Board/Validators";
import { isNotControlCharacter } from "View/isNotControlCharacter";
import { Clipboard } from "./Clipboard";
import { isFirefox } from "./isFirefox";
import { isSafari } from "./isSafari";
import { Wheel } from "./Wheel/Wheel";

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
		/*
		if (isEditInProcess()) {
			if ((event.ctrlKey || event.metaKey) && event.code === "KeyV") {
				event.preventDefault();
				navigator.clipboard.readText().then(clipboardText => {
					try {
						const data = JSON.parse(clipboardText);
						const isDataValid = validateItemsMap(data);
						if (isDataValid) {
							board.paste(data);
						} else {
							throw new Error();
						}
					} catch (error) {
						const originalClipboardData = new DataTransfer();
						originalClipboardData.setData(
							"text/plain",
							clipboardText,
						);
						const pasteEvent = new ClipboardEvent("paste", {
							bubbles: true,
							cancelable: true,
							clipboardData: originalClipboardData,
						});
						event.target?.dispatchEvent(pasteEvent);
					}
				});
			}
			return;
		}
		*/

		const context = board.selection.getContext();
		if (
			(context === "EditTextUnderPointer" ||
				context === "SelectByRect" ||
				context === "EditUnderPointer") &&
			checkHotkeys(
				{
					duplicate: () => board.selection.duplicate(),
					bringToFront: () => board.selection.bringToFront(),
					sendToBack: () => board.selection.sendToBack(),
					delete: () => board.selection.removeFromBoard(),
					textBold: () => event.preventDefault(),
					textItalic: () => event.preventDefault(),
					textStrike: () => event.preventDefault(),
					textUnderline: () => event.preventDefault(),
				},
				event,
			)
		) {
			return;
		}

		if (
			!isEditInProcess() &&
			checkHotkeys(
				{
					selectAll: () => board.selection.addAll(),
				},
				event,
			)
		) {
			return;
		}
		if (
			checkHotkeys(
				{
					undo: () => board.events?.undo(),
					redo: () => board.events?.redo(),
				},
				event,
			)
		) {
			return;
		}
		if (
			context !== "EditTextUnderPointer" &&
			!isEditInProcess() &&
			checkHotkeys(
				{
					select: () => board.tools.select(),
					text: () => board.tools.addText(),
					sticker: () => board.tools.addSticker(),
					shape: () => board.tools.addShape(),
					connector: () => board.tools.addConnector(),
					pen: () => board.tools.addDrawing(),
					frame: () => board.tools.addFrame(),
					zoomIn: () => board.camera.zoomInToViewCenter(),
					zoomOut: () => board.camera.zoomOutFromViewCenter(),
					zoomDefault: () => board.camera.zoomToViewCenter(1),
					cancel: () => board.tools.cancel(),
					undo: () => board.events?.undo(),
					redo: () => board.events?.redo(),
				},
				event,
			)
		) {
			return;
		} else if (
			isNotControlCharacter(event.key) &&
			board.selection.items.isSingle()
		) {
			const item = board.selection.items.getSingle();

			if (context === "EditTextUnderPointer") {
				board.selection.editText();
				return;
			} else if (
				item &&
				(item instanceof Shape ||
					item instanceof Sticker ||
					item instanceof Connector ||
					item instanceof RichText ||
					item instanceof Frame) &&
				board.selection.getContext() === "EditUnderPointer"
			) {
				if (
					!(
						event.ctrlKey ||
						event.metaKey ||
						event.altKey ||
						event.shiftKey
					) &&
					event.key !== "Tab" && // All non-printable keys
					!event.key.startsWith("Arrow") &&
					event.key !== "Enter" &&
					event.key !== "Escape" &&
					event.key !== "Backspace" &&
					event.key !== "Delete" &&
					event.key !== "Home" &&
					event.key !== "End" &&
					event.key !== "PageUp" &&
					event.key !== "PageDown"
				) {
					board.selection.editText(event.key);
				}

				return;
			}
		}

		if (isFirefox()) {
			checkHotkeys(
				{
					copy: e =>
						e?.currentTarget?.dispatchEvent(
							new ClipboardEvent("copy", {
								bubbles: true,
								clipboardData: new DataTransfer(),
							}),
						),
					paste: e =>
						e?.currentTarget?.dispatchEvent(
							new ClipboardEvent("paste", { bubbles: true }),
						),
				},
				event,
			);
		}

		board.keyboard.keyDown(event);
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
		const context = board.selection.getContext();
		isHotkeyPushed("undo", event);
		isHotkeyPushed("redo", event);
		if (
			(context === "EditTextUnderPointer" ||
				context === "EditUnderPointer" ||
				context === "SelectByRect") &&
			checkHotkeys(
				{
					textBold: () => board.selection.setFontStyle(["bold"]),
					textItalic: () => board.selection.setFontStyle(["italic"]),
					textStrike: () =>
						board.selection.setFontStyle(["line-through"]),
					textUnderline: () =>
						board.selection.setFontStyle(["underline"]),
				},
				event,
			)
		) {
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

	function onPaste(event: ClipboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}
		if (isEditInProcess()) {
			const text = event.clipboardData.getData("text/plain");
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

		const items = event.clipboardData.items;
		for (const item of items) {
			if (item.type.indexOf("image") !== -1) {
				const file = item.getAsFile();
				const reader = new FileReader();
				reader.onload = event => {
					const image = new ImageItem(event.target?.result);
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
			const richText = board.add(new RichText(new Mbr()));
			richText.transformation.translateTo(
				board.pointer.point.x,
				board.pointer.point.y,
			);
			richText.transformation.scaleBy(1, 1);
			richText.editor.setMaxWidth(600);
			richText.editor.setSelectionHorisontalAlignment("left");
			richText.insideOf = richText.itemType;
			const lines = text.split("\n");
			lines.forEach((line: string, index: number) => {
				const endPath = richText.editorEditor.end(
					richText.editor.editor,
					[],
				);
				richText.editorTransforms.insertText(
					richText.editor.editor,
					line,
					{ at: endPath },
				);
				if (index < lines.length - 1) {
					const splitPath = richText.editorEditor.end(
						richText.editor.editor,
						[],
					);
					richText.editorTransforms.splitNodes(
						richText.editor.editor,
						{ at: splitPath, always: true },
					);
				}
			});
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
			console.log("event.target?.result", event.target?.result);
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
