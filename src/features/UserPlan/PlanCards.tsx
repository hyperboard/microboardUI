import { useAccount } from "App/useAccount";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { billingApi } from "shared/api";
import { useConfirmModalContext } from "features/Modal/ConfirmModal";
import { notify } from "shared/ui-lib/Toast";
import { PlanCard, type PlanState } from "./PlanCard";
import styles from "./PlanCards.module.css";
import { SELECT_PAYMENT_MODAL_ID } from "./SelectPaymentModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { conf } from "Board/Settings";
const { i18n } = conf;
import { setModalData } from "shared/ui-lib/UiModal/UiModalContext";

const annualToMonthlyPrice = (price?: number) =>
	price ? Math.round(price / 12) : 0;

export function BasicPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModalConfirm } = useConfirmModalContext();
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		billingApi
			.getPlans()
			.then(({ data }) => {
				const basicPlan = data?.find(({ id }) => id === "basic");

				setPlan(basicPlan ?? null);
			})
			.finally(() => setIsLoading(false));
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
			account.billingInfo.plan.name === "plus" ||
			account.billingInfo.plan.name === "plusAI"
		) {
			if (account.billingInfo.plan.status === "pending_cancellation") {
				return "pending";
			}

			return "downgrade";
		}

		return "current";
	};

	const onDowngrade = () => {
		openModalConfirm(
			<h2 className={styles.downgradeHeading}>
				{t("userPlan.downgradeModal.heading", {
					planName:
						conf.planNames[
							account.billingInfo?.plan.name ?? "basic"
						],
				})}
			</h2>,
			<p className={styles.downgradeDesc}>
				{t("userPlan.downgradeModal.description", {
					planName:
						conf.planNames[
							account.billingInfo?.plan.name ?? "basic"
						],
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
					body: t("userPlan.downgradeModal.description", {
						planName:
							conf.planNames[
								account.billingInfo?.plan.name ?? "basic"
							],
						currentPeriodEnd: new Intl.DateTimeFormat(
							i18n.language,
							{
								year: "numeric",
								month: "numeric",
								day: "numeric",
							},
						).format(
							new Date(account.billingInfo?.plan.endDate ?? 0),
						),
					}),
				});
				Promise.resolve();
			},
			async () => {},
			t("userPlan.downgradeModal.confirm", {
				planName:
					conf.planNames[account.billingInfo?.plan.name ?? "basic"],
			}),
			t("userPlan.downgradeModal.cancel"),
			styles.downgradeConfirmation,
		);
	};

	return (
		<PlanCard
			onDowngrade={onDowngrade}
			name={t("userPlan.plans.basic.name")}
			// description={t("userPlan.plans.basic.description")}
			features={t("userPlan.plans.basic.features", {
				returnObjects: true,
			})}
			additionalFeature={t("userPlan.plans.basic.tokensFeature")}
			additionalFeatureTooltip={t("userPlan.tokensTooltip")}
			activationDate={new Intl.DateTimeFormat(i18n.language, {
				year: "numeric",
				month: "numeric",
				day: "numeric",
			}).format(
				new Date(account.billingInfo?.plan.endDate ?? 0).getTime() +
					24 * 60 * 60 * 1000,
			)}
			price={t("userPlan.free")}
			variant="basic"
			state={getBasicSubState()}
			isLoading={isLoading}
		/>
	);
}

export function PlusAIPlanCard(): JSX.Element {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const { openModalConfirm } = useConfirmModalContext();

	const [plan, setPlan] = useState<billingApi.Plan | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		billingApi
			.getPlans()
			.then(({ data }) => {
				const plusAIPlan = data?.find(({ id }) => id === "plusAI");

				setPlan(plusAIPlan ?? null);
			})
			.finally(() => setIsLoading(false));
	}, [account.isLoggedIn]);

	const getPlusSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.plan.name === "basic"
		) {
			return "available";
		}

		if (account.billingInfo.plan.name === plan?.name) {
			return "current";
		}

		if (account.billingInfo.plan.name === "pro") {
			if (account.billingInfo.plan.status === "pending_cancellation") {
				return "pending";
			}
			return "downgrade";
		}

		return "available";
	};

	const onDowngrade = () => {
		openModalConfirm(
			<h2 className={styles.downgradeHeading}>
				{t("userPlan.downgradeModal.heading", {
					planName: conf.planNames["plusAI"],
				})}
			</h2>,
			<p className={styles.downgradeDesc}>
				{t("userPlan.downgradeModal.description", {
					planName: conf.planNames["plusAI"],
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
					body: t("userPlan.downgradeModal.description", {
						planName: conf.planNames["plusAI"],
						currentPeriodEnd: new Intl.DateTimeFormat(
							i18n.language,
							{
								year: "numeric",
								month: "numeric",
								day: "numeric",
							},
						).format(
							new Date(account.billingInfo?.plan.endDate ?? 0),
						),
					}),
				});
				Promise.resolve();
			},
			async () => {},
			t("userPlan.downgradeModal.confirm", {
				planName: conf.planNames["plusAI"],
			}),
			t("userPlan.downgradeModal.cancel"),
			styles.downgradeConfirmation,
		);
	};

	const handleOpenPaymentModal = async (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(SELECT_PAYMENT_MODAL_ID);
		return;
	};

	const handleBuyTokens = async (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();

		setModalData({
			mode: "tokens",
			amount: 1000,
		});

		openModal(SELECT_PAYMENT_MODAL_ID);
		return;
	};

	const isPlusAIPlan = account.billingInfo?.plan.name === plan?.name;
	const planState = getPlusSubState();

	return (
		<PlanCard
			name={t("userPlan.plans.plusAI.name")}
			// description={t("userPlan.plans.plus.description")}
			features={t("userPlan.plans.plusAI.features", {
				returnObjects: true,
			})}
			additionalFeature={t("userPlan.plans.plusAI.tokensFeature")}
			additionalFeatureTooltip={t("userPlan.tokensTooltip")}
			variant="plus"
			price={
				isPlusAIPlan
					? 8
					: account.getIsAnnualPayment()
						? annualToMonthlyPrice(plan?.annualPrice)
						: plan?.price
			}
			isTokenPrice={isPlusAIPlan}
			oldPrice={
				!isPlusAIPlan && account.getIsAnnualPayment()
					? typeof plan?.price === "number"
						? plan.price
						: null
					: null
			}
			state={planState}
			onSubscribe={
				isPlusAIPlan ? handleBuyTokens : handleOpenPaymentModal
			}
			onDowngrade={onDowngrade}
			isLoading={isLoading}
			buttonText={isPlusAIPlan ? t("userPlan.buyTokens") : undefined}
		/>
	);
}

export function PlusPlanCard(): JSX.Element {
	const { t } = useTranslation();
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const { openModalConfirm } = useConfirmModalContext();

	const [plan, setPlan] = useState<billingApi.Plan | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		billingApi
			.getPlans()
			.then(({ data }) => {
				const plusPlan = data?.find(({ id }) => id === "plus");

				setPlan(plusPlan ?? null);
			})
			.finally(() => setIsLoading(false));
	}, [account.isLoggedIn]);

	const getPlusSubState = (): PlanState => {
		if (
			!account.billingInfo ||
			account.billingInfo?.plan.name === "basic"
		) {
			return "available";
		}

		if (account.billingInfo.plan.name === plan?.name) {
			return "current";
		}

		if (account.billingInfo.plan.name === "pro") {
			if (account.billingInfo.plan.status === "pending_cancellation") {
				return "pending";
			}
			return "downgrade";
		}

		return "available";
	};

	const onDowngrade = () => {
		openModalConfirm(
			<h2 className={styles.downgradeHeading}>
				{t("userPlan.downgradeModal.heading", {
					planName: conf.planNames["plus"],
				})}
			</h2>,
			<p className={styles.downgradeDesc}>
				{t("userPlan.downgradeModal.description", {
					planName: conf.planNames["plus"],
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
					body: t("userPlan.downgradeModal.description", {
						planName: conf.planNames["plus"],
						currentPeriodEnd: new Intl.DateTimeFormat(
							i18n.language,
							{
								year: "numeric",
								month: "numeric",
								day: "numeric",
							},
						).format(
							new Date(account.billingInfo?.plan.endDate ?? 0),
						),
					}),
				});
				Promise.resolve();
			},
			async () => {},
			t("userPlan.downgradeModal.confirm", {
				planName: conf.planNames["plus"],
			}),
			t("userPlan.downgradeModal.cancel"),
			styles.downgradeConfirmation,
		);
	};

	const handleOpenPaymentModal = async (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(SELECT_PAYMENT_MODAL_ID);
		return;
	};

	const isPlusPlan = account.billingInfo?.plan.name === plan?.name;
	const planState = getPlusSubState();

	return (
		<PlanCard
			name={t("userPlan.plans.plus.name")}
			// description={t("userPlan.plans.plus.description")}
			features={t("userPlan.plans.plus.features", {
				returnObjects: true,
			})}
			variant="basic"
			price={
				isPlusPlan
					? 6
					: account.getIsAnnualPayment()
						? annualToMonthlyPrice(plan?.annualPrice)
						: plan?.price
			}
			additionalFeature={t("userPlan.plans.plus.tokensFeature")}
			additionalFeatureTooltip={t("userPlan.tokensTooltip")}
			isTokenPrice={isPlusPlan}
			oldPrice={
				!isPlusPlan && account.getIsAnnualPayment()
					? typeof plan?.price === "number"
						? plan.price
						: null
					: null
			}
			state={planState}
			onSubscribe={handleOpenPaymentModal}
			onDowngrade={onDowngrade}
			isLoading={isLoading}
		/>
	);
}

export function ProPlanCard() {
	const { t } = useTranslation();
	const account = useAccount();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		billingApi.getPlans().finally(() => setIsLoading(false));
	}, [account.isLoggedIn]);

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
			// description={t("userPlan.plans.pro.description")}
			features={t("userPlan.plans.pro.features", {
				returnObjects: true,
			})}
			additionalFeature={t("userPlan.plans.pro.tokensFeature")}
			price={t("userPlan.customPrice")}
			variant="pro"
			contact
			unlimited
			isLoading={isLoading}
			state={getProSubState()}
		/>
	);
}
