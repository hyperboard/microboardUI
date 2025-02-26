import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { useBoundingClientRect } from "lib/useClientRect";
import { useHoverState } from "lib/useHoverState";
import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./LimitsTable.module.css";

// Smells

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
];

const PER_MONTH_MODELS_ORDER = ["tts-1-hd"];

export function LimitsTable() {
	const account = useAccount();
	const models = account.billingInfo?.models;
	const { t } = useTranslation();
	const DESCRIPTION_MAP = {
		"gpt-4o-mini": t("ai.models.gpt-4o-mini.description"),
		"gpt-4o": t("ai.models.gpt-4o.description"),
		"deepseek-reasoner": t("ai.models.deepseek-reasoner.description"),
		"flux-schnell": t("ai.models.image-generation.description"),
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
					limit={limits.daily?.limit || limits.weekly?.limit || 0}
					remaining={
						limits.daily?.remaining || limits.weekly?.remaining || 0
					}
					enabled={isEnabled}
				/>
			))}
		</table>
	);
}

export function PerMonthLimitsTable() {
	const account = useAccount();
	const models = account.billingInfo?.models;
	const { t } = useTranslation();
	const DESCRIPTION_MAP = {
		"tts-1-hd": t("ai.models.tts-1-hd.description"),
	};

	const sortedModels = models
		?.filter(({ id }) => PER_MONTH_MODELS_ORDER.includes(id))
		.sort(
			(a, b) =>
				PER_MONTH_MODELS_ORDER.indexOf(a.id) -
				PER_MONTH_MODELS_ORDER.indexOf(b.id),
		);

	return (
		<table className={styles.table}>
			<thead className={styles.row}>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>
						{t("userPlan.limitsTable.modelName")}
					</th>
					<th className={styles.limit}>
						{t("userPlan.limitsTable.requestsPerMonth")}
					</th>
				</tr>
			</thead>
			{sortedModels?.map(({ limits, isEnabled, id }) => (
				<ModelRow
					name={DISPLAYNAME_MAP[id]}
					description={DESCRIPTION_MAP[id] ?? ""}
					limit={limits.monthly?.limit || 0}
					remaining={limits.monthly?.remaining || 0}
					enabled={isEnabled}
					isAudio
				/>
			))}
		</table>
	);
}

function calculateAudioLength(symbolsCount: number): number {
	const symbolsPerMinute = 750;
	return Math.floor(symbolsCount / symbolsPerMinute);
}

type ModelRowProps = {
	name: string;
	description: string;
	remaining: number | null;
	limit: number | null;
	enabled: boolean;
	isAudio?: boolean;
};

function ModelRow({
	description,
	limit,
	name,
	remaining,
	enabled,
	isAudio = false,
}: ModelRowProps) {
	const { t } = useTranslation();
	const { elementRef, rect } = useBoundingClientRect<HTMLTableCellElement>();
	const { handlePointerEnter, handlePointerLeave, isHover } = useHoverState();
	return (
		<tr className={styles.row}>
			<td className={styles.model}>
				<p className={styles.modelName}>{name}</p>
				<p className={styles.modelDescription}>{description}</p>
			</td>
			<td
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
				ref={elementRef}
				className={clsx(
					styles.limit,
					!enabled && styles.modelDisabled,
					remaining === 0 && styles.modelLimitReached,
				)}
			>
				{enabled ? (
					!remaining ? (
						<span className={styles.unlimited}>
							{t("userPlan.unlimited")}
						</span>
					) : (
						<>
							{remaining}/{limit}{" "}
							{isAudio
								? t("userPlan.limitsTable.symbols")
								: t("userPlan.limitsTable.requests")}
							{isAudio && <br />}
							{isAudio
								? `(~${calculateAudioLength(remaining)}/${calculateAudioLength(limit ?? 0)} ${t("userPlan.limitsTable.audioLengthMinutes")})`
								: ""}
						</>
					)
				) : (
					<>
						0/0
						<Tooltip
							text={t("userPlan.limitsTable.availableOnPlus")}
							x={(rect?.left ?? 0) + (rect?.width ?? 0) - 55}
							y={(rect?.top ?? 0) + (rect?.height ?? 0) + 12}
							visible={isHover}
						/>
					</>
				)}
			</td>
		</tr>
	);
}

type Props = {
	text: string;
	x?: number;
	y?: number;
	visible?: boolean;
};

function Tooltip({ text, x, y, visible }: Props) {
	return createPortal(
		<div
			className={clsx(
				styles.tipContainer,
				styles.bottomRight,
				visible && styles.visible,
			)}
			style={{ left: x, top: y }}
		>
			<div className={clsx(styles.tip)}>
				<span className={clsx(styles.tipText, styles.center)}>
					{text}
				</span>
			</div>
		</div>,
		document.getElementById("tooltip")!,
	);
}
