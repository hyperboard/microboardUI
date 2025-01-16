import { useAccount } from "App/useAccount";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Logo } from "View/Icon";
import { BasicPlanCard, PlusPlanCard, ProPlanCard } from "./PlanCards";
import style from "./UserPlanPage.module.css";
import { UserPlanUsage } from "./UserPlanUsage";

export function UserPlanPage(): JSX.Element {
	const navigate = useNavigate();
	const account = useAccount();
	const { t } = useTranslation();

	const defaultModel = account.billingInfo?.models.find(
		model => model.isDefault,
	);

	const handleOpenProfileSettings = () => {
		navigate(-1);
	};
	return (
		<div>
			<header className={style.heading}>
				<Logo />
				<span>Microboard</span>
			</header>
			<main className={style.content}>
				<h1 className={style.h1}>{t("userPlan.upgradePlan")}</h1>
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
				<div className={style.cards}>
					<BasicPlanCard />
					<PlusPlanCard />
					<ProPlanCard />
				</div>
				<Button
					pattern="ghostFilled"
					className={style.back}
					onClick={handleOpenProfileSettings}
				>
					Back to Profile settings
				</Button>
			</main>
		</div>
	);
}
