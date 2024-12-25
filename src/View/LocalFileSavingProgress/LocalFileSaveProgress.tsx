import React from "react";
import { useAppContext } from "View/AppContext";
import styles from "./LocalFileSaveProgress.module.css";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { UiPanel } from "View/Ui/UiPanel";

const LocalFileSaveProgress: React.FC = () => {
	const { app } = useAppContext();
	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["events"],
		observer: forceUpdate,
	});

	if (!app.getBoard().getBoardId().includes("local")) {
		return null;
	}

	return (
		<UiPanel className={styles.unauthText}>
			{app.getBoard().events?.getSaveFileTimeout()
				? "Saving..."
				: "Saved"}
		</UiPanel>
	);
};

export default LocalFileSaveProgress;
