import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { useBoundingClientRect } from "shared/lib/useClientRect";
import { useHoverState } from "shared/lib/useHoverState";
import React from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import styles from "./LimitsTable.module.css";

// Smells
const DISPLAYNAME_MAP = {
	"gpt-4o-mini": "GPT-4o mini",
	"gpt-4o": "GPT-4o",
	"deepseek-reasoner": "DeepSeek",
	"flux-schnell": "Flux.1 schnell",
	"flux-pro": "Flux pro",
	"tts-1-hd": "Text to speech HD",
};

const MODELS_ORDER = [
	"gpt-4o-mini",
	"gpt-4o",
	"deepseek-reasoner",
	"flux-schnell",
	"flux-pro",
	"tts-1-hd",
];

export function LimitsTable() {
	const account = useAccount();
	const models = account.billingInfo?.models;
	const { t } = useTranslation();

	const sortedModels = models
		?.filter(({ id }) => MODELS_ORDER.includes(id))
		.sort(
			(model1, model2) =>
				MODELS_ORDER.indexOf(model1.id) -
				MODELS_ORDER.indexOf(model2.id),
		);

	return (
		<table className={styles.table}>
			<thead className={styles.row}>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>
						{t("userPlan.limitsTable.modelName")}
					</th>
					<th>
						Basic
						<div>{t("userPlan.limitsTable.costPerRequest")}</div>
					</th>
					<th>
						Plus
						<div>{t("userPlan.limitsTable.costPerRequest")}</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{sortedModels?.map(model => (
					<ModelRow
						key={model.id}
						name={DISPLAYNAME_MAP[model.id] || model.displayName}
						description={t(`models.descriptions.${model.id}`, "")}
						tokenCost={model.tokenCost}
						id={model.id}
					/>
				))}
			</tbody>
		</table>
	);
}

type ModelRowProps = {
	name: string;
	description: string;
	tokenCost: number;
	id: string;
};

function ModelRow({ description, name, tokenCost, id }: ModelRowProps) {
	const { t } = useTranslation();
	const { elementRef, rect } = useBoundingClientRect<HTMLTableCellElement>();
	const { handlePointerEnter, handlePointerLeave, isHover } = useHoverState();

	const isAvailableInBasic = id === "gpt-4o-mini";
	const isAvailableInPlus = tokenCost > 0;

	const basicCost = isAvailableInBasic ? tokenCost : null;

	return (
		<tr className={styles.row}>
			<td className={styles.model}>
				<p className={styles.modelName}>{name}</p>
				<p className={styles.modelDescription}>{description}</p>
			</td>
			<td
				className={clsx(
					styles.limit,
					!isAvailableInBasic && styles.modelDisabled,
				)}
			>
				{isAvailableInBasic
					? basicCost
					: t("userPlan.limitsTable.unavailable")}
			</td>
			<td
				onPointerEnter={
					!isAvailableInPlus ? handlePointerEnter : undefined
				}
				onPointerLeave={
					!isAvailableInPlus ? handlePointerLeave : undefined
				}
				ref={elementRef}
				className={styles.limit}
			>
				{isAvailableInPlus ? (
					tokenCost
				) : (
					<>
						{t("userPlan.limitsTable.unavailable")}
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

type TooltipProps = {
	text: string;
	x?: number;
	y?: number;
	visible?: boolean;
};

function Tooltip({ text, x, y, visible }: TooltipProps) {
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
