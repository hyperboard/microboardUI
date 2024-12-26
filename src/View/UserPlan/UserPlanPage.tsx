import React from "react";
import { Logo } from "View/Icon";
import style from "./UserPlanPage.module.css";
import { UserPlanUsage } from "./UserPlanUsage";
import { BasicPlanCard, PlusPlanCard, ProPlanCard } from "./PlanCards";
import { Button } from "shared/ui-lib/Button";
import { useNavigate } from "react-router-dom";

export function UserPlanPage() {
	const navigate = useNavigate();

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
				<h1 className={style.h1}>User Plan</h1>
				<UserPlanUsage
					aiModel="aboba"
					availableRequests={20}
					subscriptionEndDate={new Date()}
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
