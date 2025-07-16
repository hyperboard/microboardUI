import React from "react";
import { useAppContext } from "features/AppContext";
import styles from "./LocalFileSaveProgress.module.css";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { UiPanel } from "shared/ui-lib/UiPanel";

const LocalFileSaveProgress: React.FC = () => {
  const { app } = useAppContext();
  const forceUpdate = useForceUpdate();
  useAppSubscription({
    subjects: ["board"], // previously used events subscription
    observer: forceUpdate,
  });

  if (
    !app.getBoard().getBoardId().includes("local") ||
    !app.getLocalEditFileHandler()
  ) {
    return null;
  }

  return (
    <UiPanel className={styles.unauthText}>
      {app.getBoard().events?.log.saveFileTimeout ? "Saving..." : "Saved"}
    </UiPanel>
  );
};

export default LocalFileSaveProgress;
