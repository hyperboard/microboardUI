import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./UserPlanUsage.module.css";
import { Icon } from "shared/ui-lib/Icon";
import { LIMITS_MODAL_ID } from "features/UserPlan/LimitsModal";
import { HISTORY_MODAL_ID } from "features/UserPlan/HistoryModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { useAccount } from "App/useAccount";
import clsx from "clsx";

type Props = {
	cancellationDate?: string | Date;
	status: "active" | "pending_cancellation";
	planName: string;
	isFree: boolean;
	onCancel?: () => void;
	history?: boolean;
	hasHistory?: boolean;
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
	cancellationDate,
	status,
	planName,
	isFree = true,
	onCancel,
	history,
	hasHistory,
}: Props) {
	const { t, i18n } = useTranslation();
	const { openModal } = useUiModalContext();
	const account = useAccount();

	const handleOpenLimitsModal = () => openModal(LIMITS_MODAL_ID);
	const handleOpenHistoryModal = () => openModal(HISTORY_MODAL_ID);

	const formattedCancellationDate = new Intl.DateTimeFormat(i18n.language, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).format(new Date(cancellationDate ?? Date.now()));
	const previousCancellationDate = new Date(
		new Date(cancellationDate ?? Date.now()).setDate(
			new Date(cancellationDate ?? Date.now()).getDate() - 1,
		),
	);

	const formattedPreviousCancellationDate = new Intl.DateTimeFormat(
		i18n.language,
		{
			year: "numeric",
			month: "numeric",
			day: "numeric",
		},
	).format(previousCancellationDate);

	const tokensBalance = account.billingInfo?.tokens.totalTokensBalance || 0;

	return (
		<div className={styles.container}>
			<div className={styles.planUsageText}>
				<p className={styles.planUsage}>
					{isFree ? (
						<>
							{t("userPlan.currentPlanFree.part1")}
							<span
								className={clsx(
									styles.planHighlight,
									styles.basicPlan,
								)}
							>
								{t("userPlan.plans.basic.name")}
							</span>
							{t("userPlan.currentPlanFree.part2", {
								tokensBalance,
							})}{" "}
							{!history && (
								<span
									className={styles.limitsBtn}
									onClick={handleOpenLimitsModal}
								>
									{t("userPlan.limits")}{" "}
									<Icon
										width={24}
										height={24}
										iconName="ArrowRightSm"
									/>
								</span>
							)}
						</>
					) : (
						<>
							{status === "pending_cancellation" ? (
								<>
									{t("userPlan.currentPlanPending.part1")}
									<span
										className={clsx(styles.planHighlight, {
											[styles.plusPlan]:
												planName === "plus",
											[styles.proPlan]:
												planName === "pro",
										})}
									>
										{planName}
									</span>
									{t("userPlan.currentPlanPending.part2", {
										cancellationDate:
											formattedCancellationDate,
									})}
								</>
							) : (
								<>
									{t("userPlan.currentPlanActive.part1")}
									<span
										className={clsx(styles.planHighlight, {
											[styles.plusPlan]:
												planName === "plus",
											[styles.proPlan]:
												planName === "pro",
										})}
									>
										{planName}
									</span>
									{t("userPlan.currentPlanActive.part2", {
										cancellationDate:
											formattedPreviousCancellationDate,
										tokensBalance,
									})}
								</>
							)}
						</>
					)}
				</p>

				<p className={styles.paymentActions}>
					{status === "active" && onCancel && (
						<span onClick={onCancel} className={styles.cancel}>
							{t("userPlan.cancelPayment")}
						</span>
					)}
					{history
						? hasHistory && (
								<span
									onClick={handleOpenHistoryModal}
									className={styles.limitsBtn}
								>
									{t("userPlan.paymentHistoryHeading")}
									{!isFree && "."}
								</span>
							)
						: !isFree && (
								<span
									className={styles.limitsBtn}
									onClick={handleOpenLimitsModal}
								>
									{status === "active"
										? t("userPlan.nextPayment", {
												paymentDate:
													formattedCancellationDate,
											})
										: t("userPlan.limits")}
									<Icon
										width={24}
										height={24}
										iconName="ArrowRightSm"
									/>
								</span>
							)}{" "}
				</p>
			</div>
		</div>
	);
}
