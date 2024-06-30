import { App } from "App";
import { Board } from "Board";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useState } from "react";
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
};

export function ToolsPanel({ app, board }: Props) {
	const [openedMenu, setOpenedMenu] = useState("None");
	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["tools", "camera", "events"],
		observer: forceUpdate,
	});

	const toggleMenu = (menu: string) =>
		setOpenedMenu(prev => (prev === menu ? "None" : menu));
	const isExport = board.tools.getExport();

	if (isExport) {
		return null;
	}

	return (
		<PanelContext.Provider value={{ board, toggleMenu, openedMenu }}>
			<UiPanel
				style={{
					position: "absolute",
					top: "50%",
					transform: "translateY(-50%)",
					left: 8,
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
