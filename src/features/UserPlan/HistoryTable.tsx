import { useAccount } from "App/useAccount";
import React from "react";
import styles from "./LimitsTable.module.css";
import { useTranslation } from "react-i18next";
import { SETTINGS } from "Board/Settings";
const { i18n } = SETTINGS;

const PAYMENT_TYPE_DISPLAYNAME = {
	card: "Card",
	crypto: "Crypto",
};

// Plan display name mapping
const PLAN_DISPLAYNAME = {
	plus: "Plus Subscription",
	"Token Purchase": "Token Purchase",
};

export function HistoryTable() {
	const account = useAccount();
	const historyRecords = account.billingHistory.filter(
		entry => entry.planId !== "basic",
	);
	const { t } = useTranslation();

	return (
		<table className={styles.table}>
			<thead>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>
						{t("userPlan.historyTable.plan")}
					</th>
					<th>{t("userPlan.historyTable.paymentDate")}</th>
					<th>{t("userPlan.historyTable.price")}</th>
					<th>{t("userPlan.historyTable.paymentType")}</th>
				</tr>
			</thead>
			{historyRecords?.map(
				({
					id,
					startDate,
					endDate,
					planName,
					price,
					symbol,
					paymentType,
				}) => (
					<ModelRow
						key={id}
						name={planName}
						startDate={startDate}
						endDate={endDate}
						price={price}
						paymentType={paymentType}
						symbol={symbol}
					/>
				),
			)}
		</table>
	);
}

const centToUsd = (cents: number) => cents / 100;

const formatDate = (date: string) =>
	new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(date ?? Date.now()));

type ModelRowProps = {
	name: string;
	startDate: string;
	endDate: string;
	price: number;
	paymentType: "card" | "crypto";
	symbol?: string;
};

function ModelRow({
	endDate,
	name,
	startDate,
	price,
	paymentType,
	symbol,
}: ModelRowProps) {
	const { t } = useTranslation();

	const getPlanDisplayName = (planName: string) => {
		return i18n.language === "ru"
			? t(`userPlan.historyTable.planDisplayName.${planName}`, planName)
			: PLAN_DISPLAYNAME[planName] || planName;
	};

	return (
		<tr>
			<td className={styles.model}>
				<p className={styles.modelName}>{getPlanDisplayName(name)}</p>
				<p className={styles.modelDescription}>
					{formatDate(startDate)} - {formatDate(endDate)}
				</p>
			</td>
			<td>{formatDate(startDate)}</td>
			<td>
				{paymentType === "card"
					? `$${centToUsd(price)}`
					: `${price} ${symbol}`}
			</td>
			<td>{PAYMENT_TYPE_DISPLAYNAME[paymentType]}</td>
		</tr>
	);
}
