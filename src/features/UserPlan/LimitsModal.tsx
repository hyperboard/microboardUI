import { useAccount } from "App/useAccount";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { useConfirmModalContext } from "features/Modal/ConfirmModal";
import { notify } from "shared/ui-lib/Toast";
import { LimitsTable } from "features/UserPlan/LimitsTable";
import { PLAN_NAMES } from "features/UserPlan/PlanCards";
import { USER_PLAN_MODAL_ID } from "features/UserPlan/UserPlanModal";
import { UserPlanUsage } from "features/UserPlan/UserPlanUsage";
import styles from "./UserPlanModal.module.css";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

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
					}).format(new Date(account.billingInfo?.plan.endDate ?? 0)),
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
					cancellationDate={account.billingInfo?.plan.endDate}
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
				</main>
				<button className={styles.plansBtn} onClick={handleBackButton}>
					<Icon iconName="ArrowLeft1" />
					{t("userPlan.backToPlans")}
				</button>
			</div>
		</UiModal>
	);
}
