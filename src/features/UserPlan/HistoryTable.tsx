import { useAccount } from "App/useAccount";
import i18n from "shared/Lang";
import React from "react";
import styles from "./LimitsTable.module.css";
import { useTranslation } from "react-i18next";

const PAYMENT_TYPE_DISPLAYNAME = {
	card: "Card",
	crypto: "Crypto",
};

const PLAN_DISPLAYNAME = {
	plus: "Подписка Plus",
};

export function HistoryTable() {
	const account = useAccount();
	const historyRecords = account.billingHistory;
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
					startDate,
					endDate,
					planName,
					price,
					symbol,
					paymentType,
				}) => (
					<ModelRow
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
	return (
		<tr>
			<td className={styles.model}>
				<p className={styles.modelName}>{PLAN_DISPLAYNAME[name]}</p>
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
