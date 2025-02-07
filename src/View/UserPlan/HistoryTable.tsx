import { useAccount } from "App/useAccount";
import i18n from "Lang";
import React from "react";
import styles from "./LimitsTable.module.css";

export function HistoryTable() {
	const account = useAccount();
	const historyRecords = account.billingHistory;
	return (
		<table cellSpacing={0} className={styles.table}>
			<thead>
				<tr className={styles.header}>
					<th className={styles.modelsHeading}>Тариф</th>
					<th>Дата оплаты</th>
					<th>Сумма</th>
				</tr>
			</thead>
			{historyRecords?.map(({ startDate, endDate, planName, price }) => (
				<ModelRow
					name={planName}
					startDate={startDate}
					endDate={endDate}
					price={price}
				/>
			))}
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
};

function ModelRow({ endDate, name, startDate, price }: ModelRowProps) {
	return (
		<tr>
			<td className={styles.model}>
				<p className={styles.modelName}>{name}</p>
				<p className={styles.modelDescription}>
					{formatDate(startDate)} - {formatDate(endDate)}
				</p>
			</td>
			<td>{formatDate(startDate)}</td>
			<td>${centToUsd(price)}</td>
		</tr>
	);
}
