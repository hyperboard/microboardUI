import { useAccount } from "App/useAccount";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import React, { useEffect, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import {
	BasicPlanCard,
	PLAN_NAMES,
	PlusPlanCard,
	ProPlanCard,
} from "./PlanCards";
import styles from "./UserPlanModal.module.css";
import { UserPlanUsage } from "./UserPlanUsage";
import type { OpenAIModels } from "App/Connection";
import { notify } from "View/Ui/Toast";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { ToggleMark } from "View/UserPanel/CommentsPanel/ToggleMark";
import type { Plan } from "shared/api/billing";

export const USER_PLAN_MODAL_ID = Symbol("userPlanModal");

export function UserPlanModal() {
	const { openModal } = useUiModalContext();
	const { t, i18n } = useTranslation();
	const account = useAccount();
	const { openModalConfirm } = useConfirmModalContext();

	const currentModelId: OpenAIModels =
		account.billingInfo?.plan.name === "plus" ? "gpt-4o" : "gpt-4o-mini";
	const currentModel = account.billingInfo?.models.find(
		({ id }) => id === currentModelId,
	);

	const handleOpenProfileSettings: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(PROFILE_SETTINGS_MODAL_ID);
	};

	const handleToggleAnnualPayment = () => {
		account.toggleIsAnnualPayment();
	};

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

	useEffect(() => {
		account.fetchBillingInfo();
	}, []);
	return (
		<UiModal modalId={USER_PLAN_MODAL_ID} closeByBgClick={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("userPlan.upgradePlan")}</h1>
				<UserPlanUsage
					onCancel={onDowngrade}
					isFree={account.billingInfo?.plan.name === "basic"}
					planName={
						PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"]
					}
					aiModel={currentModel?.displayName ?? "Unknown"}
					availableRequests={
						currentModel?.limits.daily.remaining ||
						currentModel?.limits.weekly.remaining
					}
					tokensUsageResetDate={
						(account.billingInfo?.plan.name === "plus"
							? currentModel?.limits.daily.resetDate
							: currentModel?.limits.weekly.resetDate) ??
						new Date()
					}
					status={account.billingInfo?.plan.status ?? "active"}
					cancellationDate={account.billingInfo?.plan.periodEnd}
				/>
				<button
					className={styles.annualPayment}
					onClick={handleToggleAnnualPayment}
				>
					Ежегодный платеж
					<ToggleMark isActive={account.getIsAnnualPayment()} />
				</button>
				<div className={styles.cards}>
					<BasicPlanCard />
					<PlusPlanCard />
					<ProPlanCard />
				</div>
				<Button
					pattern="ghostFilled"
					className={styles.back}
					onClick={handleOpenProfileSettings}
				>
					{t("userPlan.backToProfile")}
				</Button>
			</div>
		</UiModal>
	);
}
