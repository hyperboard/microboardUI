import React from "react";
import { useAppContext } from "features/AppContext";
import styles from "./LocalFileSaveProgress.module.css";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UiPanel } from "shared/ui-lib/UiPanel";

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
