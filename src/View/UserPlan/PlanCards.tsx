import { useAccount } from "App/useAccount";
import React, { useEffect, useState, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { billingApi } from "shared/api";
import { useUiModalContext } from "View/Ui/UiModal";
import { PlanCard, type PlanState } from "./PlanCard";
import { SELECT_PAYMENT_MODAL_ID } from "./SelectPaymentModal";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { notify } from "View/Ui/Toast";
import i18n from "Lang";
import styles from "./PlanCards.module.css";

const PLAN_NAMES = {
	basic: i18n.t("userPlan.plans.basic.name"),
	plus: i18n.t("userPlan.plans.basic.name"),
};

export function BasicPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModalConfirm } = useConfirmModalContext();
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);

	useEffect(() => {
		billingApi.getPlans().then(({ data }) => {
			const basicPlan = data?.find(({ id }) => id === "basic");

			setPlan(basicPlan ?? null);
		});
	}, [account.isLoggedIn]);

	const getBasicSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.plan.name === plan?.name
		) {
			return "current";
		}

		if (
			account.billingInfo.plan.name === "pro" ||
			account.billingInfo.plan.name === "plus"
		) {
			return "downgrade";
		}

		return "current";
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
				notify({ header: "Тариф обновлен", body: "Бла бла бла бла" });
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

	if (!plan) {
		return null;
	}

	return (
		<PlanCard
			onDowngrade={onDowngrade}
			name={t("userPlan.plans.basic.name")}
			description={t("userPlan.plans.basic.description")}
			features={t("userPlan.plans.basic.features", {
				returnObjects: true,
			})}
			price={t("userPlan.free")}
			variant="basic"
			state={getBasicSubState()}
		/>
	);
}

export function PlusPlanCard(): JSX.Element {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModal } = useUiModalContext();

	const [plan, setPlan] = useState<billingApi.Plan | null>(null);

	useEffect(() => {
		billingApi.getPlans().then(({ data }) => {
			const plusPlan = data?.find(({ id }) => id === "plus");

			setPlan(plusPlan ?? null);
		});
	}, [account.isLoggedIn]);

	const getPlusSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.plan.name === "basic" ||
			account.billingInfo?.plan.name === "pro"
		) {
			return "available";
		}

		if (account.billingInfo.plan.name === plan?.name) {
			return "current";
		}

		return "available";
	};

	if (!plan) {
		return <></>;
	}

	const handleOpenPaymentModal = async (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(SELECT_PAYMENT_MODAL_ID);
		return;
	};
	return (
		<PlanCard
			name={t("userPlan.plans.plus.name")}
			description={t("userPlan.plans.plus.description")}
			features={t("userPlan.plans.plus.features", {
				returnObjects: true,
			})}
			variant="plus"
			price={plan.price}
			state={getPlusSubState()}
			onSubscribe={handleOpenPaymentModal}
		/>
	);
}

export function ProPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();

	const getProSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.plan.name === "basic" ||
			account.billingInfo?.plan.name === "plus"
		) {
			return "available";
		}

		if (account.billingInfo.plan.name === "pro") {
			return "current";
		}

		return "available";
	};

	return (
		<PlanCard
			name={t("userPlan.plans.pro.name")}
			description={t("userPlan.plans.pro.description")}
			features={t("userPlan.plans.pro.features", {
				returnObjects: true,
			})}
			price={t("userPlan.customPrice")}
			variant="pro"
			contact
			unlimited
			state={getProSubState()}
		/>
	);
}
