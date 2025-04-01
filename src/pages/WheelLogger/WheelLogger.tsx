import { LogEntryType, WheelEventLogger } from "App/Wheel/WheelEventLogger";
import React, { useEffect, useLayoutEffect, useState } from "react";
import styles from "./WheelLogger.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { AppContext, useAppContext } from "features/AppContext";
import { AppView } from "features/AppView";
import { useBoardsList } from "App/useBoardsList";

export const WheelEventLoggerPage: React.FC = () => {
	const { app } = useAppContext();
	const board = app.getBoard();
	const boardsList = useBoardsList();
	const [events, setEvents] = useState<LogEntryType[]>([]);
	const [mousePosition, setMousePosition] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	useEffect(() => {
		const logger = new WheelEventLogger(setEvents, setMousePosition);
		return () => logger.cleanup();
	}, []);

	const exportData = (): void => {
		const blob = new Blob([JSON.stringify(events, null, 2)], {
			type: "application/json",
		});
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		const browserInfo =
			navigator.userAgent.match(
				/(Firefox|Chrome|Safari|Edge|Opera)/,
			)?.[0] || "UnknownBrowser";
		a.download = `wheel_events_${browserInfo}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	useLayoutEffect(() => {
		boardsList.loadBoards().then(() => {
			boardsList.createBoard().then(boardId => {
				app.openBoard(boardId).then(() => {
					app.render();
				});
			});
		});
	}, []);

	if (!board) {
		return <div></div>;
	}

	return (
		<>
			<AppContext.Provider value={{ app, board }}>
				<AppView />
			</AppContext.Provider>
			<div className={styles.loggerContainer}>
				<div className={styles.loggerTitle}>Wheel Event Logger</div>
				<div className={styles.loggerMouse}>
					Mouse: ({mousePosition.x}, {mousePosition.y})
				</div>
				<div className={styles.loggerEvents}>
					{events.slice(0, 10).map((entry, index) => (
						<div key={index}>
							{`ΔX: ${entry.deltaX}, ΔY: ${entry.deltaY}, Mode: ${entry.deltaMode}`}
						</div>
					))}
				</div>
				<UiButton
					variant="secondary"
					className={styles.loggerButton}
					onClick={exportData}
					size="sm"
				>
					Export Data
				</UiButton>
			</div>
		</>
	);
};
