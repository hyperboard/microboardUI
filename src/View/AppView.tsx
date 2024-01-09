import React from "react";
import ReactDOM from "react-dom";
import { App } from "App";
import { Canvas } from "./Canvas";
import { TitlePanel } from "./TitlePanel";
import { ToolsPanel } from "./ToolsPanel";
import { ZoomPanel } from "./ZoomPanel";
import { ContextPanel } from "./ContextPanel";
import {
	isEditInProcess,
	RichText,
	toggleEdit,
} from "../Board/Items/RichText/RichText";
import { updateFPS } from "./fpsCounter";
import { validateItemsMap } from "Board/Validators";
import { Mbr } from "Board/Items";
import { ImageItem } from "Board/Items/Image";
import { TextEditors } from "./TextEditor/TextEditor";
import { isNotControlCharacter } from "./isNotControlCharacter";
import { SidePanel } from "./SidePanel";
import { SidePanelState } from "./SidePanel/SidePanelState";

export class AppView extends React.Component<{
	app: App;
}> {
	containerRef = React.createRef<HTMLDivElement>();

	disableContextMenuIds = ["CanvasContainer", "ContextPanel", "TitlePanel"];

	options = {
		pointerdown: {},
		pointerup: {},
		click: {},
	};

	sidePanelState = new SidePanelState();

	animationFrameId: number | null = null;

	update = (): void => {
		if (this.animationFrameId) {
			return; // Function already scheduled to run
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.forceUpdate();
			this.animationFrameId = null;
		});
	};

	render(): React.ReactElement {
		const { app } = this.props;
		const board = app.getBoard();
		if (!board) {
			return <div></div>;
		}

		return (
			<div
				style={{
					width: "100%",
					height: "100%",
					backgroundColor: "rgba(200,200,200,0.2)"
				}}
				
			>
				<div
					ref={this.containerRef}
				>
					<Canvas app={app} board={board} />
					<TextEditors app={app} board={board} />
					<ToolsPanel
						app={app}
						board={board}
						sidePanelState={this.sidePanelState}
					/>
					<ZoomPanel app={app} board={board} />
					<ContextPanel app={app} board={board} />
					<TitlePanel
						board={board}
						sidePanelState={this.sidePanelState}
					/>
				</div>
				<SidePanel app={app} sidePanelState={this.sidePanelState} />
			</div>
		);
	}

	onClick = (event: MouseEvent): boolean => {
		const board = this.props.app.getBoard();
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
	};

	onWheel = (event: WheelEvent): void => {
		event.preventDefault();
		event.stopPropagation();
		this.props.app.onWheel(event);
	};

	onContextMenu = (event: MouseEvent): void => {
		const target = event.target;
		if (target instanceof HTMLElement) {
			if (target.classList.contains("NoContextMenu")) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	};

	onPointerMove = (event: PointerEvent): boolean => {
		const board = this.props.app.getBoard();
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
	};

	onKeyDown = (event: KeyboardEvent): void => {
		const board = this.props.app.getBoard();
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
		if ((event.ctrlKey || event.metaKey) && (key === "KeyC" || key === "KeyV")) {
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
	};

	onKeyUp = (event: KeyboardEvent): void => {
		const board = this.props.app.getBoard();
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
	};

	onResize = (): void => {
		const board = this.props.app.getBoard();
		if (!board) {
			return;
		}
		board.camera.onWindowResize();
	};

	onCopy = (event): void => {
		if (isEditInProcess()) {
			return;
		}
		const board = this.props.app.getBoard();
		if (!board) {
			return;
		}
		const data = board.selection.copy();
		const text = JSON.stringify(data);
		event.clipboardData.setData("text/plain", text);
		event.preventDefault();
	};

	onPaste = (event): void => {
		if (isEditInProcess()) {
			return;
		}
		const board = this.props.app.getBoard();
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
	};

	onDrop = (event): void => {
		event.preventDefault();
		const board = this.props.app.getBoard();
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
	};

	componentDidMount(): void {
		this.props.app.boardSubject.subscribe(this.update);
		const container = this.containerRef.current;
		// updateFPS();
		if (container) {
			container.addEventListener("wheel", this.onWheel, {
				capture: true,
				passive: false,
			});
			window.addEventListener("resize", this.onResize);
			container.addEventListener("contextmenu", this.onContextMenu, {
				capture: false,
				passive: false,
			});
			container.addEventListener("pointermove", this.onPointerMove);
			window.addEventListener("keydown", this.onKeyDown);
			window.addEventListener("keyup", this.onKeyUp);
			container.addEventListener("copy", this.onCopy);
			container.addEventListener("paste", this.onPaste);
			window.addEventListener("drop", this.onDrop);
			window.addEventListener("dragover", event => {
				event.preventDefault();
			});
			/*
			container.addEventListener("pointerdown", this.onPointerDown);
			container.addEventListener("pointerup", this.onPointerUp);
			container.addEventListener("dblclick", this.onClick);
			*/
			const board = this.props.app.getBoard();
			if (!board) {
				return;
			}
			board.camera.onWindowResize();
		}
	}

	componentWillUnmount(): void {
		this.props.app.boardSubject.unsubscribe(this.update);
		const container = this.containerRef.current;
		if (container) {
			container.removeEventListener("wheel", this.onWheel);
			window.removeEventListener("resize", this.onResize);
			container.removeEventListener("contextmenu", this.onContextMenu);
			container.removeEventListener("pointermove", this.onPointerMove);
			window.removeEventListener("keydown", this.onKeyDown);
			window.removeEventListener("keyup", this.onKeyUp);
			container.removeEventListener("copy", this.onCopy);
			container.removeEventListener("paste", this.onPaste);
			window.removeEventListener("drop", this.onDrop);

			/*
			container.removeEventListener("pointerdown", this.onPointerDown);
			container.removeEventListener("pointerup", this.onPointerUp);
			container.removeEventListener("dblclick", this.onClick);
			*/
		}
	}
}

export function getRender(app: App): () => void {
	return function () {
		ReactDOM.render(
			<AppView app={app} />,
			document.getElementById("root") as HTMLDivElement,
		);
	};
}
