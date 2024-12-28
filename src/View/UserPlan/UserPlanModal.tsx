import { useAccount } from "App/useAccount";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import React, { type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import { BasicPlanCard, PlusPlanCard, ProPlanCard } from "./PlanCards";
import styles from "./UserPlanModal.module.css";
import { UserPlanUsage } from "./UserPlanUsage";

export const USER_PLAN_MODAL_ID = Symbol("userPlanModal");

export function UserPlanModal() {
	const { openModal } = useUiModalContext();
	const { t } = useTranslation();
	const account = useAccount();

	const defaultModel = account.billingInfo?.models.find(
		model => model.isDefault,
	);

	const handleOpenProfileSettings: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(PROFILE_SETTINGS_MODAL_ID);
	};

	return (
		<UiModal modalId={USER_PLAN_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("userPlan.upgradePlan")}</h1>
				<UserPlanUsage
					aiModel={defaultModel?.displayName ?? "Unknown"}
					availableRequests={
						(defaultModel?.limits.weekly ?? 0) -
						(defaultModel?.limits.weeklyUsed ?? 0)
					}
					tokensUsageResetDate={
						account.billingInfo?.plan.periodEnd ?? new Date()
					}
				/>
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
					Back to Profile settings
				</Button>
			</div>
		</UiModal>
	);
}
