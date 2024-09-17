import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "View/AppContext";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useState } from "react";
import { AddConnector } from "./Buttons/AddConnector";
import { AddDrawing } from "./Buttons/AddDrawing/AddDrawing";
import { AddFrame } from "./Buttons/AddFrame";
import { AddImage } from "./Buttons/AddImage";
import { AddShape } from "./Buttons/AddShape/AddShape";
import { AddSticker } from "./Buttons/AddSticker";
import { AddText } from "./Buttons/AddText";
import { Redo } from "./Buttons/Redo";
import { Select } from "./Buttons/Select";
import { Undo } from "./Buttons/Undo";
import { PanelContext } from "./PanelContext";
import style from "./ToolsPanel.module.css";
import { AddTemplate } from "./Buttons/AddTemplate";

export function ToolsPanel() {
	const [openedMenu, setOpenedMenu] = useState("None");

	const toggleMenu = (menu: string) =>
		setOpenedMenu(prev => (prev === menu ? "None" : menu));

	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["tools"],
		observer: forceUpdate,
	});

	return (
		<PanelContext.Provider value={{ toggleMenu, openedMenu }}>
			<div className={style.wrapper}>
				<UiPanel vertical padding={0} zIndex={20}>
					<AddTemplate />
					<Select />
					<AddDrawing />
					<AddText />
					<AddShape />
					<AddConnector />
					<AddSticker />
					<AddFrame />
					<AddImage />
				</UiPanel>
				<UiPanel vertical padding={0}>
					<Undo />
					<Redo />
				</UiPanel>
			</div>
		</PanelContext.Provider>
	);
}
