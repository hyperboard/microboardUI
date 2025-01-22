import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./UserPlanUsage.module.css";

type Props = {
	availableRequests?: number | null;
	aiModel: string;
	tokensUsageResetDate: string | Date;
	cancellationDate?: string | Date;
	status: "active" | "pending_cancellation";
	planName: string;
	isFree: boolean;
	onCancel: () => void;
};

const isTomorrow = (date: Date): boolean => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	return (
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear()
	);
};

export function UserPlanUsage({
	aiModel,
	availableRequests = 0,
	tokensUsageResetDate,
	cancellationDate,
	status,
	planName,
	isFree = true,
	onCancel,
}: Props) {
	const { t, i18n } = useTranslation();
	const formattedDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(tokensUsageResetDate));

	const daily = isTomorrow(new Date(tokensUsageResetDate));

	const formattedCancellationDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(cancellationDate ?? Date.now()));
	console.log(status);

	return (
		<div className={styles.container}>
			<p className={styles.planUsage}>
				{daily ? (
					<Trans
						t={t}
						i18nKey={"userPlan.currentPlanInfoDaily"}
						values={{
							availableRequests,
							aiModel,
						}}
						components={[<span />]}
					/>
				) : (
					<Trans
						t={t}
						i18nKey={"userPlan.currentPlanInfo"}
						values={{
							availableRequests,
							aiModel,
							tokensUsageResetDate: formattedDate,
						}}
						components={[<span />]}
					/>
				)}
			</p>
			{!isFree &&
				(status === "active" ? (
					<p className={styles.planUsage}>
						{t("userPlan.currentPlanActive", {
							planName,
							cancellationDate: formattedCancellationDate,
						})}{" "}
						<button className={styles.link} onClick={onCancel}>
							{t("userPlan.cancelPayment")}
						</button>
					</p>
				) : (
					<p className={styles.planUsage}>
						{t("userPlan.currentPlanPending", {
							planName,
							cancellationDate: formattedCancellationDate,
						})}
					</p>
				))}
		</div>
	);
}
