import React from "react";
import styles from "./LimitsTable.module.css";
import { useAccount } from "App/useAccount";
import clsx from "clsx";

const DESCRIPTION_MAP = {
	"gpt-4o-mini": "Для анализа и извлечения информации из текстов",
	"gpt-4o": "Мощная модель для сложных текстов и аналитики",
	"image-generation": "Генерация изображений",
	"deepseek-chat": "Для анализа и извлечения информации из текстов",
	"deepseek-reasoner": "Для анализа и извлечения информации из текстов",
	"flux-schnell": "Для анализа и извлечения информации из текстов",
};

export function LimitsTable() {
	const account = useAccount();
	const models = account.billingInfo?.models;
	return (
		<table cellSpacing={0} className={styles.table}>
			<thead>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>Models</th>
					<th>Remaining requests per week</th>
				</tr>
			</thead>
			{models?.map(({ displayName, limits, isEnabled, id }) => (
				<ModelRow
					name={displayName}
					description={DESCRIPTION_MAP[id] ?? ""}
					limit={limits.daily.limit || limits.weekly.limit}
					remaining={
						limits.daily.remaining || limits.weekly.remaining
					}
					enabled={isEnabled}
				/>
			))}
		</table>
	);
}

type ModelRowProps = {
	name: string;
	description: string;
	remaining: number | null;
	limit: number | null;
	enabled: boolean;
};

function ModelRow({
	description,
	limit,
	name,
	remaining,
	enabled,
}: ModelRowProps) {
	return (
		<tr>
			<td className={styles.model}>
				<p className={styles.modelName}>{name}</p>
				<p className={styles.modelDescription}>{description}</p>
			</td>
			<td
				className={clsx(
					!enabled && styles.modelDisabled,
					remaining === 0 && styles.modelLimitReached,
				)}
			>
				{enabled
					? !remaining
						? `Unlimited`
						: `${remaining}/${limit}`
					: "0/0"}
			</td>
		</tr>
	);
}
