import { LogEntryType, WheelEventLogger } from "App/Wheel/WheelEventLogger";
import React, { useLayoutEffect, useRef, useState } from "react";
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
	const loggerRef = useRef<WheelEventLogger | null>(null);

	useLayoutEffect(() => {
		const init = async (): Promise<void> => {
			try {
				await boardsList.loadBoards();
				const boardId = await boardsList.createBoard();
				await app.openBoard(boardId);
				app.render();

				loggerRef.current = new WheelEventLogger(
					setEvents,
					setMousePosition,
				);

				console.log("Logger initialized successfully");
			} catch (error) {
				console.error("Initialization failed:", error);
			}
		};

		init();

		return () => {
			loggerRef.current?.cleanup();
		};
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
