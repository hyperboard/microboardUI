import React, { useState } from "react";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { AIChat, ChartType } from "./AIChat";
import styles from "./AIChatPanel.module.css";
import { Board } from "microboard-temp";
import { useTranslation } from "react-i18next";

interface Props {
  board: Board;
}

export const AIChatPanel: React.FC<Props> = ({ board }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [savedPrompt, setSavedPrompt] = useState("");
  const [savedChartType, setSavedChartType] = useState<ChartType>("Flow chart");

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
  };

  const handleClose = (): void => {
    setIsOpen(false);
  };

  const handleSavePrompt = (prompt: string, chartType: ChartType): void => {
    setSavedPrompt(prompt);
    setSavedChartType(chartType);
  };

  if (isOpen) {
    return (
      <AIChat
        board={board}
        onClose={handleClose}
        initialPrompt={savedPrompt}
        initialChartType={savedChartType}
        onSavePrompt={handleSavePrompt}
      />
    );
  }

  return (
    <UiPanel className={styles.wrapper} padding={0}>
      <button
        onClick={toggleChat}
        className={styles.panelButton}
        title={t("ai.generateAiChart")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.panelIcon}
        >
          <path d="M10 9.5 8 12l2 2.5"></path>
          <path d="m14 9.5 2 2.5-2 2.5"></path>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"></path>
        </svg>
      </button>
    </UiPanel>
  );
};

export default AIChatPanel;
