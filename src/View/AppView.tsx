import * as React from "react";
import { App } from "App";
import { Canvas } from "./Canvas";
import { TitlePanel } from "./TitlePanel";
import { ToolsPanel } from "./ToolsPanel";
import { ZoomPanel } from "./ZoomPanel";
import { ContextPanel } from "./ContextPanel";
import { TextEditors } from "./TextEditor/TextEditor";
import { SidePanel } from "./SidePanel";
import { SidePanelState } from "./SidePanel/SidePanelState";
import { ContextMenuState, ContextMenu } from "./ContextMenu";
import {
	ExportSnapshotProvider,
	ExportSelectionBox,
	ExportSnapshotMode,
} from "App/ExportBoardSnapshot";

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
	contextMenuState = new ContextMenuState();

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
		const urlString = new URL(window.location.href).pathname;
		const boardId = urlString.split("/").pop();

		if (boardId) {
			app.openBoard(boardId!);
		}

		if (!board) {
			return <div></div>;
		}

		return (
			<ExportSnapshotProvider board={board}>
				<div
					style={{
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(200,200,200,0.2)",
						overflow: "hidden",
					}}
				>
					<div ref={this.containerRef}>
						<Canvas
							app={app}
							board={board}
							contextMenuState={this.contextMenuState}
						/>
						<ExportSnapshotMode>
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
						</ExportSnapshotMode>
					</div>
					<ExportSnapshotMode>
						<SidePanel
							app={app}
							sidePanelState={this.sidePanelState}
							contextMenuState={this.contextMenuState}
						/>
						<ContextMenu
							app={app}
							contextMenuState={this.contextMenuState}
						/>
					</ExportSnapshotMode>

					<ExportSelectionBox />
				</div>
			</ExportSnapshotProvider>
		);
	}

	componentDidMount(): void {
		this.props.app.boardSubject.subscribe(this.update);
		const container = this.containerRef.current;
		const controller = this.props.app.controller;
		// updateFPS();
		if (container) {
			container.addEventListener("wheel", controller.onWheel, {
				capture: true,
				passive: false,
			});
			window.addEventListener("resize", controller.onResize);
			container.addEventListener(
				"contextmenu",
				controller.onContextMenu,
				{
					capture: false,
					passive: false,
				},
			);
			container.addEventListener("pointermove", controller.onPointerMove);
			window.addEventListener("keydown", controller.onKeyDown);
			window.addEventListener("keyup", controller.onKeyUp);
			container.addEventListener("copy", controller.onCopy);
			container.addEventListener("paste", controller.onPaste);
			window.addEventListener("drop", controller.onDrop);
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
		const controller = this.props.app.controller;
		if (container) {
			container.removeEventListener("wheel", controller.onWheel);
			window.removeEventListener("resize", controller.onResize);
			container.removeEventListener(
				"contextmenu",
				controller.onContextMenu,
			);
			container.removeEventListener(
				"pointermove",
				controller.onPointerMove,
			);
			window.removeEventListener("keydown", controller.onKeyDown);
			window.removeEventListener("keyup", controller.onKeyUp);
			container.removeEventListener("copy", controller.onCopy);
			container.removeEventListener("paste", controller.onPaste);
			window.removeEventListener("drop", controller.onDrop);

			/*
			container.removeEventListener("pointerdown", this.onPointerDown);
			container.removeEventListener("pointerup", this.onPointerUp);
			container.removeEventListener("dblclick", this.onClick);
			*/
		}
	}
}
