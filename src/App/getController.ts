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
import { validateItemsMap } from "Board/Validators";

export function getController(getBoard: () => Board) {
	const isMouse = true;
	const isTrackpad = true;

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
				["Shape", "Sticker"].indexOf(item.itemType) > -1 &&
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
	}

	function onKeyUp(event: KeyboardEvent): void {
		const board = getBoard();
		if (!board) {
			return;
		}

		if (isEditInProcess()) {
			return;
		}

		board.keyboard.keyUp(event);
		if (!board.selection.tool.keyUp(board.keyboard.up)) {
			board.tools.keyUp(board.keyboard.up);
		}
	}

	function onClick(event: MouseEvent): boolean {
		const board = getBoard();
		if (!board) {
			return false;
		}
		if (event.detail === 2) {
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
			}
		}
		return false;
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

	function onPointerMove(event: PointerEvent): boolean {
		const board = getBoard();
		if (!board) {
			return false;
		}
		const { camera, tools } = board;
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

	function onCopy(event): void {
		if (isEditInProcess()) {
			return;
		}
		const board = getBoard();
		if (!board) {
			return;
		}
		const data = board.selection.copy();
		const text = JSON.stringify(data);
		event.clipboardData.setData("text/plain", text);
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
		onPointerMove,
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
