import { useTranslation } from "react-i18next";
import { PlanCard, type PlanState } from "./PlanCard";
import React from "react";
import { useAccount } from "App/useAccount";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { notify } from "View/Ui/Toast";

export function BasicPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModalConfirm } = useConfirmModalContext();

	const getBasicSubState = (): PlanState => {
		if (!account.billingInfo || account.billingInfo?.tariff === "basic") {
			return "current";
		}

		if (
			account.billingInfo.tariff === "pro" ||
			account.billingInfo.tariff === "plus"
		) {
			return "downgrade";
		}

		return "current";
	};

	const onDowngrade = () => {
		openModalConfirm(
			`Отказаться от тарифа ${account.billingInfo?.tariff}`,
			`Доступ к ${account.billingInfo?.tariff} останется в течение оплаченного срока до ${account.billingInfo?.resetAt}, после этого вы потеряете преимущества тарифа ${account.billingInfo?.tariff} и вернетесь к Базовому тарифу.`,
			async () => {
				notify({ header: "Тариф обновлен", body: "Бла бла бла бла" });
				Promise.resolve();
			},
		);
	};
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

	const getPlusSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.tariff === "basic" ||
			account.billingInfo?.tariff === "pro"
		) {
			return "available";
		}

		if (account.billingInfo.tariff === "plus") {
			return "current";
		}

		return "available";
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
			price={12}
			state={getPlusSubState()}
		/>
	);
}

export function ProPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();

	const getProSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.tariff === "basic" ||
			account.billingInfo?.tariff === "plus"
		) {
			return "available";
		}

		if (account.billingInfo.tariff === "pro") {
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
