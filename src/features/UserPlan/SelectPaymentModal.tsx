import React, {
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import styles from "./SelectPaymentModal.module.css";
import { USER_PLAN_MODAL_ID } from "./UserPlanModal";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notify } from "shared/ui-lib/Toast";
import { billingApi } from "shared/api";
import { useAccount } from "App/useAccount";
import {
	ConnectButton,
	useAccountModal,
	useChainModal,
	useConnectModal,
} from "@rainbow-me/rainbowkit";
import { useSendTransaction, useAccount as useWalletAccount } from "wagmi";
import { parseEther } from "viem";
import "@rainbow-me/rainbowkit/styles.css";
import { Icon } from "shared/ui-lib/Icon";
import { CSSTransition } from "react-transition-group";
import clsx from "clsx";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { Tooltip } from "shared/ui-lib/UiButton/Tooltip";

export const SELECT_PAYMENT_MODAL_ID = Symbol("selectPaymentModal");

type ModalData = {
	mode?: "tokens";
	amount?: number;
};

export function SelectPaymentModal(): JSX.Element {
	const { openModal, data } = useUiModalContext();
	const location = useLocation();
	const navigate = useNavigate();
	const account = useAccount();
	const { t } = useTranslation();
	const [isDisabled, setIsDisabled] = useState(false);
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);
	const [active, setActive] = useState<"stripe" | "crypto">("stripe");
	const [isPurchaseTokensMode, setIsPurchaseTokensMode] = useState(false);
	const [tokenAmount, setTokenAmount] = useState(1000);

	const { accountModalOpen } = useAccountModal();
	const { chainModalOpen } = useChainModal();
	const { openConnectModal, connectModalOpen } = useConnectModal();
	const { sendTransaction } = useSendTransaction();
	const { address, isConnected, chain } = useWalletAccount();

	useEffect(() => {
		billingApi.getPlans().then(({ data }) => {
			const plusPlan = data?.find(({ id }) => id === "plus");

			setPlan(plusPlan ?? null);
		});

		const modalData = data as ModalData | null;
		if (modalData?.mode === "tokens") {
			setIsPurchaseTokensMode(true);
			if (modalData.amount && modalData.amount >= 100) {
				setTokenAmount(modalData.amount);
			}
		} else {
			const searchParams = new URLSearchParams(location.search);
			if (searchParams.get("mode") === "tokens") {
				setIsPurchaseTokensMode(true);
				const amount = parseInt(
					searchParams.get("amount") || "1000",
					10,
				);
				setTokenAmount(isNaN(amount) ? 1000 : amount);
			}
		}
	}, [account.isLoggedIn, location.search, data]);

	function assertPlanExists(
		plan: billingApi.Plan | null,
	): asserts plan is billingApi.Plan {
		if (!plan) {
			throw new Error("Did not find plus plan");
		}
	}

	const handleOpenPlans: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(USER_PLAN_MODAL_ID);
	};

	const handleTokenAmountChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = parseInt(event.target.value, 10);
		if (!isNaN(value) && value >= 100) {
			setTokenAmount(value);
		}
	};

	const calculateTokenPrice = (amount: number): number => {
		return Math.ceil((amount / 1000) * 8 * 100) / 100;
	};

	const handleStripe = async (): Promise<void> => {
		try {
			if (isPurchaseTokensMode) {
				const data = await account.purchaseTokens(
					tokenAmount,
					"stripe",
					`${window.location.origin}/boards`,
					`${window.location.origin}/boards`,
				);

				if (data?.paymentUrl) {
					window.location.href = data.paymentUrl;
				} else {
					throw new Error("No payment URL received");
				}
			} else {
				assertPlanExists(plan);
				await account.createCheckout(plan.id);
			}
		} catch (err) {
			if (
				err instanceof Error &&
				err.message ===
					"Unable to checkout user without email, add email first"
			) {
				notify({
					header: t("userPlan.notifications.emailNotFound.header"),
					body: (
						<>
							<Link
								to={`/bind-email/add-email?${window.location.search.substring(1)}`}
							>
								{t("auth.addEmail")}
							</Link>{" "}
							{t(
								"userPlan.notifications.emailNotFound.linkMessage",
							)}
						</>
					),
					variant: "error",
				});
			} else {
				notify({
					header: t("userPlan.notifications.paymentError.header"),
					body: t("userPlan.notifications.paymentError.body"),
					variant: "error",
				});
				console.error(err);
			}
		}
	};

	const handleCrypto: MouseEventHandler<HTMLButtonElement> = async _event => {
		if (!isConnected) {
			if (openConnectModal) {
				openConnectModal();
			}
			return;
		}

		setIsDisabled(true);

		const onSuccessGetter = (
			currency: string,
			chain: string,
			sender: string,
			planId: string,
			hash: `0x${string}`,
		): void => {
			setIsDisabled(false);
			notify({
				header: t(
					"userPlan.notifications.transactionSuccessful.header",
				),
				body: t("userPlan.notifications.transactionSuccessful.body", {
					currency,
					chain,
					sender,
				}),
				variant: "success",
			});

			if (isPurchaseTokensMode) {
				notify({
					header: t("userPlan.notifications.tokensPurchased.header"),
					body: t("userPlan.notifications.tokensPurchased.body"),
					variant: "success",
				});
				setTimeout(() => {
					navigate(0);
				}, 2000);
			} else {
				billingApi
					.confirmCryptoCheckout({
						symbol: currency,
						chain,
						sender,
						planId,
						hash,
					})
					.then(() => {
						notify({
							header: t(
								"userPlan.notifications.confirmedSuccessfully.header",
							),
							body: t(
								"userPlan.notifications.confirmedSuccessfully.body",
							),
							variant: "success",
						});
						setTimeout(() => {
							navigate(0);
						}, 2000);
					})
					.catch(err => {
						console.error(err);
						notify({
							header: t(
								"userPlan.notifications.confirmationFailed.header",
							),
							body: (
								<>
									{t(
										"userPlan.notifications.confirmationFailed.body",
										{ message: "" },
									)}{" "}
									{err.message.includes("support") ? (
										<span
											dangerouslySetInnerHTML={{
												__html: err.message.replace(
													/support/g,
													'<a href="mailto:ceo@microboard.io">support</a>',
												),
											}}
										/>
									) : (
										err.message
									)}
								</>
							),
							variant: "error",
							duration: 10_000,
						});
					});
			}
		};

		const onError = (error): void => {
			setIsDisabled(false);
			if (error.shortMessage === "User rejected the request.") {
				notify({
					header: t(
						"userPlan.notifications.transactionFailed.header",
					),
					body: t(
						"userPlan.notifications.transactionFailed.body.canceled",
					),
					variant: "warning",
				});
			} else {
				notify({
					header: t(
						"userPlan.notifications.transactionFailed.header",
					),
					body: t(
						"userPlan.notifications.transactionFailed.body.error",
					),
					variant: "error",
				});
				console.error(`Transaction Failed: ${error}`);
			}

			if ("metaMessages" in error && error.metaMessages.length >= 2) {
				const splitted = error.metaMessages[1].split(/[\s:]+/);
				const from = splitted[2];
				const to = splitted[4];
				const price = splitted[6];

				billingApi.cancelCryptoCheckout({
					sender: from,
					to,
					value: parseEther(price).toString(),
				});
			}
		};

		try {
			if (!isConnected || !address || !chain) {
				throw new Error("Wallet is not connected");
			}

			if (isPurchaseTokensMode) {
				notify({
					header: t("userPlan.notifications.notImplemented.header"),
					body: t("userPlan.notifications.notImplemented.body"),
					variant: "error",
				});
				setIsDisabled(false);
				return;
			} else {
				assertPlanExists(plan);

				const checkout = await account.createCryptoCheckout(
					chain.nativeCurrency.symbol,
					chain.name,
					address,
					plan.id,
				);

				if (!checkout.address.startsWith("0x")) {
					throw new Error("Received address has wrong format");
				}
				const guardedAddress = checkout.address as `0x${string}`;

				sendTransaction(
					{
						to: guardedAddress,
						value: BigInt(checkout.price),
					},
					{
						onSuccess: hash =>
							onSuccessGetter(
								chain.nativeCurrency.symbol,
								chain.name,
								address,
								plan.id,
								hash,
							),
						onError: onError,
					},
				);
			}
		} catch (err) {
			console.error(err);
			notify({
				header: t("userPlan.notifications.unexpectedError.header"),
				body: t("userPlan.notifications.unexpectedError.body"),
				variant: "error",
			});
			setIsDisabled(false);
		}
	};

	const tokenPriceAmount = calculateTokenPrice(tokenAmount);

	return (
		<UiModal
			modalId={SELECT_PAYMENT_MODAL_ID}
			closeByBgClick={
				!(accountModalOpen || connectModalOpen || chainModalOpen)
			}
		>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>
					{/* {isPurchaseTokensMode ? "Purchase Tokens" : "Payment"} */}
					{t("userPlan.historyTable.paymentType")}
				</h1>

				{/* {isPurchaseTokensMode && (
					<div className={styles.tokenAmountWrapper}>
						<label htmlFor="tokenAmount">Token amount:</label>
						<Input
							id="tokenAmount"
							type="number"
							min="100"
							step="100"
							value={tokenAmount}
							onChange={handleTokenAmountChange}
							className={styles.tokenAmountInput}
						/>
						<div className={styles.tokenPrice}>
							Price: ${tokenPriceAmount} ({tokenAmount} tokens at
							$8 per 1000 tokens)
						</div>
					</div>
				)} */}

				<div className={styles.cards}>
					<Card
						onClick={
							active === "stripe"
								? undefined
								: () => setActive("stripe")
						}
						active={active === "stripe"}
						title={
							<div className={styles.text}>
								{t("userPlan.paymentMethods.payByCard")}
								<div className={styles.icons}>
									<Icon
										iconName="Visa"
										width={28}
										height={20}
									/>
									<Icon
										iconName="Mastercard"
										width={28}
										height={20}
									/>
								</div>
							</div>
						}
						description={
							isPurchaseTokensMode
								? t("userPlan.paymentMethods.totalTokens", {
										tokenPriceAmount,
										tokenAmount,
									})
								: account.getIsAnnualPayment()
									? `${t("userPlan.paymentMethods.total")}: $${(Number(plan?.annualPrice) || 0) / 100} ($${(Number(plan?.annualPrice) || 0) / 12 / 100} ${t("userPlan.paymentMethods.perMonth")})`
									: `${t("userPlan.paymentMethods.total")}: $${(Number(plan?.price) || 0) / 100}`
						}
						disabled={isDisabled}
						footer={
							<>
								<div className={styles.footer}>
									<Button
										id="pay_stripe"
										pattern="primary"
										onClick={handleStripe}
										disabled={
											isDisabled || !account.info?.email
										}
									>
										{isPurchaseTokensMode
											? t("userPlan.buyTokensBtn")
											: t(
													"userPlan.paymentMethods.payWithStripe",
												)}
									</Button>
									{!account.info?.email && (
										<Button
											id="add_email"
											pattern="primary"
											onClick={() =>
												navigate(
													`/bind-email/add-email?${window.location.search.substring(1)}`,
												)
											}
											disabled={isDisabled}
										>
											Add email
										</Button>
									)}
								</div>
								<div
									className={clsx(
										styles.description,
										styles.paddingTop,
									)}
								>
									{account.info?.email
										? t(
												"userPlan.paymentMethods.subscriptionTerms",
											)
										: t(
												"userPlan.paymentMethods.addEmailToPayByCard",
											)}
								</div>
							</>
						}
					/>
					<Card
						onClick={
							active === "crypto"
								? undefined
								: () => setActive("crypto")
						}
						active={active === "crypto"}
						title={
							<div className={styles.text}>
								{t("userPlan.paymentMethods.payByCrypto")}
								<div className={styles.icons}>
									<Icon
										iconName="XRP"
										width={25}
										height={25}
									/>
									<Icon
										iconName="BTC"
										width={24}
										height={24}
									/>
									<Icon
										iconName="ETH"
										width={24}
										height={24}
									/>
								</div>
							</div>
						}
						description={
							isPurchaseTokensMode
								? t("userPlan.paymentMethods.totalTokens", {
										tokenPriceAmount,
										tokenAmount,
									})
								: t(
										"userPlan.paymentMethods.totalPaymentPeriod",
										{
											period: account.getIsAnnualPayment()
												? t(
														"userPlan.paymentMethods.period.annual",
													)
												: t(
														"userPlan.paymentMethods.period.monthly",
													),
										},
									)
						}
						disabled={isDisabled}
						footer={
							<ConnectButton.Custom>
								{({
									account: walletAccount,
									chain,
									openAccountModal,
									openChainModal,
									openConnectModal,
									mounted,
								}) => {
									if (!walletAccount || !mounted) {
										return (
											<Button
												id="crypto_connect_button"
												pattern="primary"
												onClick={openConnectModal}
												disabled={isDisabled}
												className={styles.footer}
											>
												{t(
													"userPlan.paymentMethods.connectWallet",
												)}
											</Button>
										);
									}
									return (
										// todo fix DRY
										<div>
											{t(
												"userPlan.paymentMethods.fromWallet",
												{
													name: walletAccount.displayName,
												},
											)}
											<div
												className={styles.description}
												style={{ paddingBottom: "8px" }}
											>
												{t(
													"userPlan.paymentMethods.balance",
													{
														amount: walletAccount.displayBalance,
													},
												)}
											</div>
											<div className={styles.coins}>
												<CoinCard
													onClick={() => {}} // todo set active coin when many coins
													disabled={isDisabled}
													active={true}
													coin={
														(walletAccount?.balanceSymbol ||
															"ETH") as "ETH"
													}
													title={
														<>
															<div>
																{isPurchaseTokensMode
																	? tokenPriceAmount
																	: // todo fix DRY
																		(+account
																			.cryptoRates[
																			walletAccount?.balanceSymbol ||
																				"ETH"
																		][
																			account.getIsAnnualPayment()
																				? "annualPrice"
																				: "price"
																		]).toFixed(
																			5,
																		)}
															</div>
															<div
																className={
																	styles.description
																}
															>
																on {chain?.name}
															</div>
														</>
													}
												/>
											</div>
											<div className={styles.footer}>
												<Button
													id="crypto_chain_button"
													pattern="primary"
													onClick={openAccountModal}
													disabled={isDisabled}
												>
													{t(
														"userPlan.paymentMethods.switchWallet",
													)}
												</Button>
												<Button
													id="crypto_chain_button"
													pattern="primary"
													onClick={openChainModal}
													disabled={isDisabled}
												>
													{t(
														"userPlan.paymentMethods.switchNetwork",
													)}
												</Button>
												<Button
													id="crypto_account_button"
													pattern="primary"
													onClick={handleCrypto}
													disabled={isDisabled}
												>
													{isPurchaseTokensMode
														? t(
																"userPlan.paymentMethods.buyTokens",
																{ tokenAmount },
															)
														: `${t(
																"userPlan.paymentMethods.payWithWallet",
																{
																	amount: (+account
																		.cryptoRates[
																		walletAccount?.balanceSymbol ||
																			"ETH"
																	][
																		account.getIsAnnualPayment()
																			? "annualPrice"
																			: "price"
																	]).toFixed(
																		5,
																	),
																	wallet: walletAccount.displayName,
																},
															)}`}
												</Button>
											</div>
											<div
												className={clsx(
													styles.description,
													styles.paddingTop,
												)}
											>
												{t(
													"userPlan.paymentMethods.finalPriceAdjusted",
												)}
											</div>
										</div>
									);
								}}
							</ConnectButton.Custom>
						}
					/>
				</div>
				{!location.pathname.includes("user") && (
					<Button
						pattern="ghostFilled"
						className={styles.back}
						onClick={handleOpenPlans}
					>
						{t("userPlan.paymentMethods.backToPlans")}
					</Button>
				)}
			</div>
		</UiModal>
	);
}

const Card: React.FC<{
	onClick?: MouseEventHandler<HTMLButtonElement>;
	disabled: boolean;
	title: JSX.Element;
	description: string;
	active: boolean;
	footer: JSX.Element;
}> = ({ onClick, disabled, title, description, footer, active }) => {
	return (
		<Button
			className={styles.card}
			pattern="tertiary"
			onClick={onClick}
			disabled={disabled}
		>
			<div className={styles.title}>
				<div className={styles.icons}>
					<Icon
						iconName={active ? "CheckboxFilled" : "Checkbox"}
						width={20}
						height={20}
					/>
				</div>
				<div className={styles.mainContent}>
					{title}
					<Transition active={active}>
						<div className={styles.description}>{description}</div>
					</Transition>
				</div>
			</div>
			<Transition active={active}>{footer}</Transition>
		</Button>
	);
};

const CoinCard: React.FC<{
	onClick: MouseEventHandler<HTMLButtonElement>;
	disabled: boolean;
	title: JSX.Element;
	coin: "POL" | "ETH";
	active: boolean;
}> = ({ onClick, disabled, title, active, coin }) => {
	const { t } = useTranslation();

	return (
		<Button
			className={clsx(
				styles.card,
				styles.coin,
				(active && styles.active) || "",
			)}
			pattern="tertiary"
			onClick={onClick}
			disabled={disabled}
		>
			<div className={styles.coinTitle}>
				<Icon iconName={coin} width={24} height={24} />
				<div className={styles.mainContent}>{title}</div>
			</div>
			<Tooltip
				tooltip={t("userPlan.paymentMethods.priceTooltip")}
				tooltipPosition="top"
			/>
		</Button>
	);
};

const Transition: React.FC<{ active: boolean; children: React.ReactNode }> = ({
	active,
	children,
}) => {
	const nodeRef = useRef<HTMLDivElement>(null);

	return (
		<CSSTransition
			nodeRef={nodeRef}
			in={active}
			timeout={400}
			classNames={{
				enter: styles.cardEnter,
				enterActive: styles.cardEnterActive,
				exit: styles.cardExit,
				exitActive: styles.cardExitActive,
			}}
			unmountOnExit
			onEnter={() => {
				if (nodeRef.current) {
					nodeRef.current.style.height = "0px";
				}
			}}
			onEntering={() => {
				if (nodeRef.current) {
					const height = nodeRef.current.scrollHeight;
					nodeRef.current.style.height = `${height}px`;
				}
			}}
			onEntered={() => {
				if (nodeRef.current) {
					nodeRef.current.style.height = "auto";
				}
			}}
			onExit={() => {
				if (nodeRef.current) {
					const height = nodeRef.current.scrollHeight;
					nodeRef.current.style.height = `${height}px`;
				}
			}}
			onExiting={() => {
				if (nodeRef.current) {
					nodeRef.current.style.height = "0px";
				}
			}}
		>
			<div ref={nodeRef} style={{ width: "100%" }}>
				{children}
			</div>
		</CSSTransition>
	);
};
