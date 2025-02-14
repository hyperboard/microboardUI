import React from "react";
import styles from "./LimitsTable.module.css";
import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { UiButton } from "View/Ui/UiButton";

const DISPLAYNAME_MAP = {
	"gpt-4o-mini": "GPT-4o mini",
	"gpt-4o": "GPT-4o",
	"deepseek-reasoner": "DeepSeek-R1",
	"flux-schnell": "Flux.1 schnell",
	"tts-1-hd": "Text to speech",
};

const MODELS_ORDER = [
	"deepseek-reasoner",
	"gpt-4o-mini",
	"gpt-4o",
	"flux-schnell",
	"tts-1-hd",
];

export function LimitsTable() {
	const account = useAccount();
	const models = account.billingInfo?.models;
	const { t } = useTranslation();
	const DESCRIPTION_MAP = {
		"gpt-4o-mini": t("ai.models.gpt-4o-mini.description"),
		"gpt-4o": t("ai.models.gpt-4o.description"),
		"deepseek-reasoner": t("ai.models.deepseek-chat.description"),
		"flux-schnell": t("ai.models.image-generation.description"),
		"tts-1-hd": t("ai.models.tts-1-hd.description"),
	};

	const sortedModels = models
		?.filter(({ id }) => MODELS_ORDER.includes(id))
		.sort(
			(a, b) => MODELS_ORDER.indexOf(a.id) - MODELS_ORDER.indexOf(b.id),
		);

	const isPerDayLimits = account.billingInfo?.plan.name === "plus";
	return (
		<table className={styles.table}>
			<thead className={styles.row}>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>
						{t("userPlan.limitsTable.modelName")}
					</th>
					<th>
						{" "}
						{isPerDayLimits
							? t("userPlan.limitsTable.requestsPerDay")
							: t("userPlan.limitsTable.requestsPerWeek")}
					</th>
				</tr>
			</thead>
			{sortedModels?.map(({ limits, isEnabled, id }) => (
				<ModelRow
					name={DISPLAYNAME_MAP[id]}
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
		<tr className={styles.row}>
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
				{enabled ? (
					!remaining ? (
						<span className={styles.unlimited}>Unlimited</span>
					) : (
						`${remaining}/${limit}`
					)
				) : (
					<UiButton
						className={styles.limits}
						variant="secondary"
						disabled
						tooltipPosition="bottom-left"
						tooltip="Available on Plus plan"
					>
						0/0
					</UiButton>
				)}
			</td>
		</tr>
	);
}
