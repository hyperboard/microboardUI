/* eslint-disable max-classes-per-file */
import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { HorisontalSeparator } from "View/ContextPanel/HorisontalSeparator";
import { SidePanelState } from "View/SidePanel/SidePanelState";
import { useForceUpdate } from "lib/useForceUpdate";
import * as React from "react";
import {
	AddConnector,
	AddDrawing,
	AddFrame,
	AddImage,
	AddShape,
	AddStickerTool,
	AddText,
	Redo,
	Select,
	Undo,
} from "./Buttons";
import "./ToolsPanel.css";

type Props = {
	app: App;
	board: Board;
	sidePanelState: SidePanelState;
};

export function ToolsPanel({ app, board, sidePanelState }: Props) {
	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["tools", "camera", "events"],
		observer: forceUpdate,
	});

	React.useEffect(() => {
		sidePanelState.subject.subscribe(forceUpdate);

		return () => {
			sidePanelState.subject.unsubscribe(forceUpdate);
		};
	}, [forceUpdate, sidePanelState]);

	const height = board.camera.window.height / 3;
	const top = height > 48 ? height - 48 : height;
	const isSidePanelOn = sidePanelState.isOn;
	const sidePanelWidth = sidePanelState.width;
	const left = isSidePanelOn ? sidePanelWidth + 24 : 8;

	const isExport = board.tools.getExport();

	if (isExport) {
		return null;
	}

	return (
		<div
			id="ToolsPanel"
			className="ToolsPanel"
			style={{
				top: `${top}px`,
				left: `${left}px`,
			}}
		>
			<Select
				board={board}
				isOn={board.tools.getSelect() !== undefined}
			/>
			<AddShape
				board={board}
				isOn={board.tools.getAddShape() !== undefined}
			/>
			<AddText
				board={board}
				isOn={board.tools.getAddText() !== undefined}
			/>
			<AddConnector
				board={board}
				isOn={board.tools.getAddConnector() !== undefined}
			/>
			<AddStickerTool
				board={board}
				isOn={board.tools.getAddSticker() !== undefined}
			/>
			<AddDrawing
				board={board}
				isOn={board.tools.getAddDrawing() !== undefined}
				width={board.tools.getAddDrawing()?.strokeWidth ?? 1}
			/>
			<AddImage board={board} />
			<AddFrame
				board={board}
				isOn={board.tools.getAddFrame() !== undefined}
			/>
			<HorisontalSeparator height={4}></HorisontalSeparator>

			<Undo board={board} isOn={board.events?.canUndo() ?? false} />
			<Redo board={board} isOn={board.events?.canRedo() ?? false} />
		</div>
	);
}
