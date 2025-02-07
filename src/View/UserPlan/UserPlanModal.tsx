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
import { UiSwitch } from "View/Ui/UiSwitch";
import clsx from "clsx";

export const USER_PLAN_MODAL_ID = Symbol("userPlanModal");

export function UserPlanModal() {
	const { openModal } = useUiModalContext();
	const { t, i18n } = useTranslation();
	const account = useAccount();

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

	useEffect(() => {
		account.fetchBillingInfo();
	}, []);
	return (
		<UiModal modalId={USER_PLAN_MODAL_ID} closeByBgClick={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("userPlan.upgradePlan")}</h1>
				<UserPlanUsage
					isFree={account.billingInfo?.plan.name === "basic"}
					planName={
						PLAN_NAMES[account.billingInfo?.plan.name ?? "basic"]
					}
					status={account.billingInfo?.plan.status ?? "active"}
					cancellationDate={account.billingInfo?.plan.periodEnd}
				/>
				<UiSwitch
					options={[
						{ label: "Monthly", value: false },
						{
							label: ({
								handleClick,
								btnClass,
								textClass,
								activeClass,
								isActive,
							}) => (
								<button
									onClick={handleClick}
									className={clsx(
										btnClass,
										isActive && activeClass,
									)}
								>
									<span
										className={clsx(
											textClass,
											styles.switchBtn,
										)}
									>
										<span>Annual</span>
										<span className={styles.badge}>
											Save 30%
										</span>
									</span>
								</button>
							),
							value: true,
						},
					]}
					onChange={val => account.setIsAnnualPayment(val as boolean)}
					initialValue={account.getIsAnnualPayment()}
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
					{t("userPlan.backToProfile")}
				</Button>
			</div>
		</UiModal>
	);
}
