import React, { useState, useEffect } from "react";
import styles from "./AIChat.module.css";
import { LayoutEngine } from "features/GenerateChart/lib/engine/index";
import { generateChart } from "shared/api/ai";
import { Board } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useClickOutside } from "shared/lib/useClickOutside";

const CHARACTER_LIMIT = 500;

export type ChartType = "Flow chart" | "Cloud architecture" | "Database";

interface Props {
  board: Board;
  onClose: () => void;
  initialPrompt?: string;
  initialChartType?: ChartType;
  onSavePrompt: (prompt: string, chartType: ChartType) => void;
}

export const AIChat: React.FC<Props> = ({
  board,
  onClose,
  initialPrompt = "",
  initialChartType = "Flow chart",
  onSavePrompt,
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      onSavePrompt(prompt, chartType);
    };
  }, [prompt, chartType, onSavePrompt]);

  useEffect(() => {
    const escapeHandler = (ev: KeyboardEvent): void => {
      if (ev.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", escapeHandler);

    return () => {
      window.removeEventListener("keydown", escapeHandler);
    };
  });

  const handleInputChange = (
    ev: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setPrompt(ev.target.value);
    setError(null);
  };

  const handleChartTypeChange = (
    ev: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setChartType(ev.target.value as ChartType);
    setError(null);
  };

  const handleSubmit = async (ev?: React.FormEvent): Promise<void> => {
    if (ev) {
      ev.preventDefault();
    }

    if (!prompt) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await generateChart({ input: prompt });
      if (!res.data) {
        throw new Error("No data received");
      }

      const layoutEngine = new LayoutEngine(board);
      layoutEngine.parse(res.data.message);
    } catch (err) {
      setError("Failed to generate chart. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const topHandler = (ev): void => {
    ev.stopPropagation();
  };

  const handleKeydown = (
    ev: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    ev.stopPropagation();
  };

  const ref = useClickOutside(onClose);

  return (
    <div
      className={styles.chatContainer}
      ref={ref}
      onKeyDown={topHandler}
      onPaste={(ev) => {
        ev.stopPropagation();
      }}
      onCopy={(ev) => {
        ev.stopPropagation();
      }}
    >
      <div className={styles.header}>
        <div className={styles.flexTitle}>
          <h2 className={styles.title}>{t("ai.generateAiChart")}</h2>
          <span className={styles.betaTag}>Beta</span>
        </div>
        <button onClick={onClose} className={styles.closeButton}>
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
          >
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      <p className={styles.description}>{t("ai.enterIdea")}</p>
      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <select
          className={styles.select}
          onChange={handleChartTypeChange}
          value={chartType}
          disabled={isLoading}
        >
          <option value="Flow chart">{t("ai.flowChart")}</option>
          <option value="Cloud architecture" disabled>
            {t("ai.cloudArch")}
          </option>
          <option value="Database" disabled>
            {t("ai.database")}
          </option>
        </select>
        <textarea
          className={styles.textarea}
          onChange={handleInputChange}
          placeholder={t("ai.chatPlaceholder")}
          disabled={isLoading}
          value={prompt}
          onKeyDown={(ev) => {
            handleKeydown(ev);
            if (ev.key === "Enter" && !ev.shiftKey) {
              ev.preventDefault();
              handleSubmit();
            }
            if (ev.key === "Escape") {
              onClose();
            }
          }}
          onPaste={(ev) => ev.stopPropagation()}
          onCopy={(ev) => ev.stopPropagation()}
          maxLength={CHARACTER_LIMIT}
        />
        <div className={styles.charCount}>
          {prompt.length} / {CHARACTER_LIMIT} {t("ai.symbols")}
        </div>
        <UiButton
          type="submit"
          variant="primary"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? t("ai.generating") : t("ai.generate")}
        </UiButton>
      </form>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {isLoading && (
        <div className={styles.loadingMessage}>{t("ai.processingIdea")}</div>
      )}
    </div>
  );
};
