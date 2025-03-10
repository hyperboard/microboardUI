import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { useEffect, useState } from "react";
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
import { EventList } from "./Buttons/EventList";
import AIChatPanel from "features/GenerateChart/AIChatPanel";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

export function ToolsPanel(): JSX.Element {
	const [openedMenu, setOpenedMenu] = useState("None");

	const toggleMenu = (menu: string): void =>
		setOpenedMenu(prev => (prev === menu ? "None" : menu));

	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["tools"],
		observer: forceUpdate,
	});

	useEffect(() => {}, [window.showDebug]);

	return (
		<PanelContext.Provider value={{ toggleMenu, openedMenu }}>
			<div
				className={
					window.location.protocol === "file:"
						? style.localWrapper
						: style.wrapper
				}
			>
				<UiPanel vertical padding={0} zIndex={20}>
					<AddTemplate />
					<UiSeparator vertical={false} />
					<Select rounded={"none"} />
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
				<div className={style.bottomLeftWrapper}>
					{window.showDebug && <EventList />}
					{window.enableDiagrams && (
						<AIChatPanel board={app.getBoard()} />
					)}
				</div>
			</div>
		</PanelContext.Provider>
	);
}
