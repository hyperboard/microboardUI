import { UiModal } from "View/Ui/UiModal/UiModal";
import React, { type MouseEventHandler } from "react";
import styles from "./UserPlanModal.module.css";
import { UserPlanUsage } from "./UserPlanUsage";
import { PlanCard, type PlanState } from "./PlanCard";
import { Button } from "shared/ui-lib/Button";
import { useUiModalContext } from "View/Ui/UiModal";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";
import { useTranslation } from "react-i18next";
import { useAccount } from "App/useAccount";
import { BasicPlanCard, PlusPlanCard, ProPlanCard } from "./PlanCards";

export const USER_PLAN_MODAL_ID = Symbol("userPlanModal");

export function UserPlanModal() {
	const { openModal } = useUiModalContext();
	const { t } = useTranslation();

	const handleOpenProfileSettings: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(PROFILE_SETTINGS_MODAL_ID);
	};

	return (
		<UiModal modalId={USER_PLAN_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>Upgrade Plan</h1>
				<UserPlanUsage
					aiModel="aboba"
					availableRequests={39}
					subscriptionEndDate={new Date()}
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
