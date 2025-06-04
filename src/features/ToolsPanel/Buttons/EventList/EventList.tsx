import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React, { CSSProperties, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "../ButtonWithMenu";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { History } from "./History";
import { SyncJournal } from "./SyncJournal";
import style from "./EventList.module.css";

export const EventList = React.memo(function EventList(): JSX.Element {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const [opened, setOpened] = useState(false);
	const forceUpdate = useForceUpdate();
	const buttonWithMenuRef = useRef<HTMLDivElement>(null);
	const [viewMode, setViewMode] = useState<"history" | "syncJournal">(
		"history",
	);

	useAppSubscription({
		subjects: ["board"], // previously used syncLog subject
		observer: forceUpdate,
	});

	const handleClick = (): void => {
		setOpened(prev => !prev);
	};

	const getPanelTransform = (): string => {
		if (buttonWithMenuRef.current) {
			const buttonHeight = buttonWithMenuRef.current.offsetHeight;
			return `translateY(calc(-100% + ${buttonHeight}px))`;
		}
		return "translateY(-100%)";
	};

	const listStyle: CSSProperties = {
		width: "100%",
	};

	return (
		<UiPanel vertical padding={0} zIndex={101} className={style.panel}>
			<ButtonWithMenu
				ref={buttonWithMenuRef}
				button={
					<UiButton
						id={"EventList"}
						// tooltip={t("toolsPanel.eventList.tooltip")}
						// hotkey={getHotkeyLabel("eventList")}
						onClick={handleClick}
						rounded="full"
						variant="secondary"
					>
						<Icon iconName="Gear" />
					</UiButton>
				}
				isOpen={opened}
			>
				<UiPanel
					key="EventList_Panel"
					vertical
					gap={3}
					padding={6}
					style={{
						display: "flex",
						flexDirection: "column",
						maxHeight: "90vh",
						width: "40vw",
						padding: "6px",
						overflowY: "auto",
						transform: getPanelTransform(),
						userSelect: "auto",
						overflowX: "hidden",
						flexGrow: 1,
						flexShrink: 0,
					}}
				>
					<UiPanel
						key="EventList_Mode_Selector"
						padding={3}
						gap={3}
						style={{
							display: "flex",
							justifyContent: "space-between",
							width: "100%",
						}}
					>
						<UiButton
							onClick={() => setViewMode("history")}
							style={{ width: "100%" }}
							variant={
								viewMode === "history"
									? "tertiary"
									: "secondary"
							}
							key="EventList_Mode_Selector_History"
						>
							Events History
						</UiButton>
						<UiButton
							style={{ width: "100%" }}
							onClick={() => setViewMode("syncJournal")}
							variant={
								viewMode === "syncJournal"
									? "tertiary"
									: "secondary"
							}
							key="EventList_Mode_Selector_SyncJournal"
						>
							Synchronization Journal
						</UiButton>
					</UiPanel>
					{!board.events && "Events not found"}
					{board.events && viewMode === "history" && (
						<History
							style={listStyle}
							events={{
								confirmedEvents: board.events.log.list
									.getConfirmedRecords()
									.map(record => record.event),
								eventsToSend: board.events.log.list
									.getRecordsToSend()
									.map(record => record.event),
								newEvents: board.events.log.list
									.getNewRecords()
									.map(record => record.event),
							}}
						/>
					)}
					{board.events && viewMode === "syncJournal" && (
						<SyncJournal
							style={listStyle}
							log={board.events.log.getSyncLog()}
						/>
					)}
				</UiPanel>
			</ButtonWithMenu>
		</UiPanel>
	);
});
