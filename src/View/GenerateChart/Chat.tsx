import React, { useState } from "react";
import styles from "./Chat.module.css";
import { LayoutEngine } from "View/GenerateChart/lib/engine/index";
import { generateChart } from "shared/api/ai";
import { Board } from "Board";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { useTranslation } from "react-i18next";

const CHARACTER_LIMIT = 500;

interface Props {
	board: Board;
	onClose: () => void;
}

export const Chat: React.FC<Props> = ({ board, onClose }) => {
	const { t } = useTranslation();
	const [prompt, setPrompt] = useState("");
	const [chartType, setChartType] = useState<
		"Flow chart" | "Cloud architecture" | "Database"
	>("Flow chart");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const ref = React.useRef<HTMLDivElement>(null);

	const handleInputChange = (
		ev: React.ChangeEvent<HTMLTextAreaElement>,
	): void => {
		setPrompt(ev.target.value);
		setError(null);
	};

	const handleChartTypeChange = (
		ev: React.ChangeEvent<HTMLSelectElement>,
	): void => {
		setChartType(
			ev.target.value as "Flow chart" | "Cloud architecture" | "Database",
		);
		setError(null);
	};

	const handleSubmit = async (): Promise<void> => {
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

	useOutsideClickHandler(ref, onClose);

	return (
		<div
			className={styles.chatContainer}
			ref={ref}
			onKeyDown={topHandler}
			onPaste={ev => {
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
			<div className={styles.inputContainer}>
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
					onKeyDown={handleKeydown}
					onPaste={ev => ev.stopPropagation()}
					maxLength={CHARACTER_LIMIT}
				/>
				<div className={styles.charCount}>
					{prompt.length} / {CHARACTER_LIMIT} {t("ai.symbols")}
				</div>
				<button
					className={styles.button}
					onClick={handleSubmit}
					disabled={isLoading || !prompt}
				>
					{isLoading ? "Generating..." : "Generate"}
				</button>
			</div>
			{error && <div className={styles.errorMessage}>{error}</div>}
			{isLoading && (
				<div className={styles.loadingMessage}>
					{t("ai.processingIdea")}
				</div>
			)}
		</div>
	);
};
