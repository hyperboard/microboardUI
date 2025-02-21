import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
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
import { notify } from "View/Ui/Toast";
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
import { Icon } from "View/Icon";
import { CSSTransition } from "react-transition-group";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import clsx from "clsx";

export const SELECT_PAYMENT_MODAL_ID = Symbol("selectPaymentModal");

export function SelectPaymentModal(): JSX.Element {
	const { openModal } = useUiModalContext();
	const location = useLocation();
	const navigate = useNavigate();
	const account = useAccount();
	const { t } = useTranslation();
	const [isDisabled, setIsDisabled] = useState(false);
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);
	const [active, setActive] = useState<"stripe" | "crypto">("stripe");

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
	}, [account.isLoggedIn]);

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

	const handleStripe = async (): Promise<void> => {
		try {
			assertPlanExists(plan);
			await account.createCheckout(plan.id);
		} catch (err) {
			if (
				err instanceof Error &&
				err.message ===
					"Unable to checkout user without email, add email first"
			) {
				notify({
					header: "Email not found",
					body: (
						<>
							<Link
								to={`/bind-email/add-email?${window.location.search.substring(1)}`}
							>
								Add email
							</Link>{" "}
							to your account to pay with stripe.
						</>
					),
					variant: "error",
				});
			} else {
				notify({
					header: "Оплата",
					body: "Ошибка оплаты",
					variant: "error",
				});
			}
		}
	};

	const handleCrypto: MouseEventHandler<HTMLButtonElement> = async _event => {
		// if (
		// 	event.target instanceof HTMLElement &&
		// 	/^crypto.*button$/.test(event.target.id)
		// ) {
		// 	return;
		// }

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
		): ((hash: `0x${string}`) => void) => {
			return (hash: `0x${string}`): void => {
				setIsDisabled(false);
				notify({
					header: "Transaction Successful",
					body: `Your transaction with ${currency} on ${chain} by ${sender} was completed successfully, wait for confirmations`,
					variant: "success",
				});

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
							header: "Confirmed successfully",
							body: "Your checkout has been confirmed successfully. Reloading...",
							variant: "success",
						});
						setTimeout(() => {
							navigate(0);
						}, 2000);
					})
					.catch(err => {
						console.error(err);
						notify({
							header: "Confirmation failed",
							body: (
								<>
									There was an error confirming your checkout:{" "}
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
			};
		};

		const onError = (error): void => {
			setIsDisabled(false);
			if (error.shortMessage === "User rejected the request.") {
				notify({
					header: "Transaction Failed",
					body: `You canceled the transaction`,
					variant: "warning",
				});
			} else {
				notify({
					header: "Transaction Failed",
					body: `There was an error processing your transaction`,
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
			assertPlanExists(plan);

			const checkout = await account.createCryptoCheckout(
				chain.nativeCurrency.symbol,
				chain.name,
				address,
				plan.id,
			);

			if (!checkout.address.startsWith("0x")) {
				throw new Error("Recieved address has wrong format");
			}
			const guardedAddress = checkout.address as `0x${string}`;

			sendTransaction(
				{
					to: guardedAddress,
					value: BigInt(checkout.price),
				},
				{
					onSuccess: onSuccessGetter(
						chain.nativeCurrency.symbol,
						chain.name,
						address,
						plan.id,
					),
					onError: onError,
				},
			);
		} catch (err) {
			console.error(err);
			notify({
				body: "An unexpected error occurred",
				variant: "error",
			});
			setIsDisabled(false);
		}
	};

	return (
		<UiModal
			modalId={SELECT_PAYMENT_MODAL_ID}
			closeByBgClick={
				!(accountModalOpen || connectModalOpen || chainModalOpen)
			}
		>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>Payment</h1>
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
								Pay by card, $USD
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
						description={`Total: $${account.getIsAnnualPayment() ? `${(plan?.annualPrice || 0) / 100} ($${(plan?.annualPrice || 0) / 12 / 100} per month)` : +(plan?.price || 0) / 100}`}
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
										Pay with Stripe
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
										? "By confirming your subscription, you authorize Microboard to charge your account for future payments in accordance with the company's terms. You can cancel your subscription at any time."
										: "Add email to pay with card"}
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
								Pay in crypto
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
						description={`Total payment for ${account.getIsAnnualPayment() ? "12 months" : "a month"}`}
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
												Connect wallet
											</Button>
										);
									}
									return (
										// todo fix DRY
										<div>
											From wallet:{" "}
											{walletAccount.displayName}
											<div
												className={styles.description}
												style={{ paddingBottom: "8px" }}
											>
												Balance:{" "}
												{walletAccount.displayBalance}
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
																{
																	// todo fix DRY
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
																	)
																}
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
													Switch Wallet
												</Button>
												<Button
													id="crypto_chain_button"
													pattern="primary"
													onClick={openChainModal}
													disabled={isDisabled}
												>
													Switch Network
												</Button>
												<Button
													id="crypto_account_button"
													pattern="primary"
													onClick={handleCrypto}
													disabled={isDisabled}
												>
													Pay{" "}
													{
														// todo fix DRY
														(+account.cryptoRates[
															walletAccount?.balanceSymbol ||
																"ETH"
														][
															account.getIsAnnualPayment()
																? "annualPrice"
																: "price"
														]).toFixed(5)
													}{" "}
													with{" "}
													{walletAccount.displayName}
												</Button>
											</div>
											<div
												className={clsx(
													styles.description,
													styles.paddingTop,
												)}
											>
												Final price may vary
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
						Back to Plans
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
				tooltip="Total price may various little bit"
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
