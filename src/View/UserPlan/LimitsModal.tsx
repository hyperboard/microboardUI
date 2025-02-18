import { useAccount } from "App/useAccount";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { notify } from "View/Ui/Toast";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { LimitsTable, PerMonthLimitsTable } from "View/UserPlan/LimitsTable";
import { PLAN_NAMES } from "View/UserPlan/PlanCards";
import { USER_PLAN_MODAL_ID } from "View/UserPlan/UserPlanModal";
import { UserPlanUsage } from "View/UserPlan/UserPlanUsage";
import styles from "./UserPlanModal.module.css";

export const LIMITS_MODAL_ID = Symbol("limitsModal");

export function LimitsModal() {
	const { t, i18n } = useTranslation();
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const handleBackButton = () => openModal(USER_PLAN_MODAL_ID);
	const { openModalConfirm } = useConfirmModalContext();

	const onDowngrade = () => {
		openModalConfirm(
			<h2 className={styles.downgradeHeading}>
				{t("userPlan.downgradeModal.heading", {
					planName:
						PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"],
				})}
			</h2>,
			<p className={styles.downgradeDesc}>
				{t("userPlan.downgradeModal.description", {
					planName:
						PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"],
					currentPeriodEnd: new Intl.DateTimeFormat(i18n.language, {
						year: "numeric",
						month: "numeric",
						day: "numeric",
					}).format(
						new Date(account.billingInfo?.plan.periodEnd ?? 0),
					),
				})}
			</p>,
			async () => {
				await account.unsubscribe();
				notify({
					header: "Тариф обновлен",
					body: "Автоматическое продление отменено",
				});
				Promise.resolve();
			},
			async () => {},
			t("userPlan.downgradeModal.confirm", {
				planName: PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"],
			}),
			t("userPlan.downgradeModal.cancel"),
			styles.downgradeConfirmation,
		);
	};

	return (
		<UiModal modalId={LIMITS_MODAL_ID} closeByBgClick={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>
					{t("userPlan.currentPlanHeading")}
				</h1>
				<UserPlanUsage
					cancellationDate={account.billingInfo?.plan.periodEnd}
					planName={
						PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"]
					}
					isFree={account.billingInfo?.plan.name === "basic"}
					history
					hasHistory={account.billingHistory.length > 0}
					onCancel={
						account.billingInfo?.plan.name !== "basic"
							? onDowngrade
							: undefined
					}
					status={account.billingInfo?.plan.status ?? "active"}
				/>
				<main className={styles.tables}>
					<LimitsTable />
					<PerMonthLimitsTable />
				</main>
				<button className={styles.plansBtn} onClick={handleBackButton}>
					<Icon iconName="ArrowLeft1" />
					{t("userPlan.backToPlans")}
				</button>
			</div>
		</UiModal>
	);
}
