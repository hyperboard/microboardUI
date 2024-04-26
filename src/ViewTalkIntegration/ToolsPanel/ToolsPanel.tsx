import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect, useState } from "react";
import { SidePanelState } from "ViewTalkIntegration/SidePanelState";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { UiSeparator } from "ViewTalkIntegration/Ui/UiSeparator/UiSeparator";
import { AddConnector } from "./Buttons/AddConnector";
import { AddDrawing } from "./Buttons/AddDrawing/AddDrawing";
import { AddImage } from "./Buttons/AddImage";
import { AddShape } from "./Buttons/AddShape";
import { AddSticker } from "./Buttons/AddSticker";
import { AddText } from "./Buttons/AddText";
import { Redo } from "./Buttons/Redo/Redo";
import { Select } from "./Buttons/Select";
import { Undo } from "./Buttons/Undo/Undo";
import { PanelContext } from "./PanelContext";

type Props = {
	app: App;
	board: Board;
	sidePanelState: SidePanelState;
};

export function ToolsPanel({ app, board, sidePanelState }: Props) {
	const [openedMenu, setOpenedMenu] = useState("None");
	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["tools", "camera", "events"],
		observer: forceUpdate,
	});

	useEffect(() => {
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

	const toggleMenu = (menu: string) =>
		setOpenedMenu(prev => (prev === menu ? "None" : menu));

	return (
		<PanelContext.Provider value={{ board, toggleMenu, openedMenu }}>
			<UiPanel
				style={{
					position: "absolute",
					top,
					left,
				}}
				vertical
			>
				<Select />
				<AddText />
				<AddSticker />
				<AddShape />
				<AddConnector />
				<AddDrawing />
				<AddImage />
				<UiSeparator />
				<Undo />
				<Redo />
			</UiPanel>
		</PanelContext.Provider>
	);
}
