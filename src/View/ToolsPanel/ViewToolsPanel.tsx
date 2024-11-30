import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "View/AppContext";
import { UiPanel } from "View/Ui/UiPanel/UiPanel";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { useEffect } from "react";
import { EventList } from "./Buttons/EventList";
import { Grab } from "./Buttons/Grab";
import { Select } from "./Buttons/Select";
import style from "./ToolsPanel.module.css";
import { UiSeparator } from "View/Ui/UiSeparator";

export function ViewToolsPanel(): JSX.Element {
	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription(app, {
		subjects: ["tools"],
		observer: forceUpdate,
	});

	useEffect(() => {}, [window.showDebug]);

	return (
		<div className={style.wrapper}>
			<UiPanel vertical padding={0} zIndex={20}>
				<Grab />
				<UiSeparator />
				<Select rounded="bottom" />
			</UiPanel>
			{window.showDebug && <EventList />}
		</div>
	);
}
