import { useTranslation } from "react-i18next";
import { PlanCard, type PlanState } from "./PlanCard";
import React, { useEffect, useState } from "react";
import { useAccount } from "App/useAccount";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { notify } from "View/Ui/Toast";
import { billingApi } from "shared/api";

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
			`Отказаться от тарифа ${account.billingInfo?.plan.name}`,
			`Доступ к ${account.billingInfo?.plan.name} останется в течение оплаченного срока до ${account.billingInfo?.plan.periodEnd}, после этого вы потеряете преимущества тарифа ${account.billingInfo?.plan.name} и вернетесь к Базовому тарифу.`,
			async () => {
				notify({ header: "Тариф обновлен", body: "Бла бла бла бла" });
				Promise.resolve();
			},
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

export function PlusPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();

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
		return null;
	}

	const handleSubscribe = async () => {
		const successUrl = `${window.location.href}?paymentStatus=success`;
		const cancelUrl = `${window.location.href}?paymentStatus=error`;

		try {
			const { data } = await billingApi.createCheckout({
				planId: plan.id,
				successUrl,
				cancelUrl,
			});

			if (!data) {
				throw new Error();
			}
			const linkElem = document.createElement("a");
			linkElem.href = data?.url;
			linkElem.target = "_blank";
			linkElem.click();
		} catch {
			notify({
				header: "Оплата",
				body: "Ошибка оплаты",
				variant: "error",
			});
		}
	};
	return (
		<PlanCard
			name={t("userPlan.plans.plus.name")}
			description={t("userPlan.plans.plus.description")}
			features={t("userPlan.plans.plus.features", {
				returnObjects: true,
			})}
			variant="plus"
			unlimited
			price={plan.price}
			state={getPlusSubState()}
			onSubscribe={handleSubscribe}
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
