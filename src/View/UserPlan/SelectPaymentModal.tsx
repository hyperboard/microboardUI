import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import React, { useEffect, useState, type MouseEventHandler } from "react";
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
import { api } from "shared/api";
import "@rainbow-me/rainbowkit/styles.css";

export const SELECT_PAYMENT_MODAL_ID = Symbol("selectPaymentModal");

type CryptoCheckout = {
	price: string;
	symbol: string;
	address: string;
};

// TODO move to cryptoApi
async function createCheckout(
	currency: string,
	chain: string,
	sender: string,
	planId: string,
): Promise<CryptoCheckout> {
	const url = `/crypto/checkout`;
	const body = { symbol: currency, chain, sender, planId };

	const res = await api.post(url, body);
	return res.data as CryptoCheckout;
}

async function cancelCheckout(
	from: string,
	to: string,
	value: string,
): Promise<void> {
	const url = "/crypto/checkout";
	const body = { sender: from, to, value };

	await api.delete(url, undefined, body);
}

async function confirmCheckout(
	currency: string,
	chain: string,
	sender: string,
	planId: string,
	hash: string,
): Promise<void> {
	const url = `/crypto/checkout`;
	const body = { symbol: currency, chain, sender, planId, hash };

	await api.patch(url, body);
}

export function SelectPaymentModal(): JSX.Element {
	const { openModal } = useUiModalContext();
	const location = useLocation();
	const navigate = useNavigate();
	const account = useAccount();
	const { t } = useTranslation();
	const [isDisabled, setIsDisabled] = useState(false);
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);

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
		// const successUrl = `${window.location.href}?paymentStatus=success`;
		// const cancelUrl = `${window.location.href}?paymentStatus=error`;

		try {
			assertPlanExists(plan);

			// const { data } = await billingApi.createCheckout({
			// 	planId: plan.id,
			// 	successUrl,
			// 	cancelUrl,
			// });

			// if (!data) {
			// 	throw new Error();
			// }
			// const linkElem = document.createElement("a");
			// linkElem.href = data?.url;
			// linkElem.target = "_blank";
			// linkElem.click();
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
								to={`/auth/add-email?${window.location.search.substring(1)}`}
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

	const handleCrypto: MouseEventHandler<HTMLButtonElement> = async event => {
		if (
			event.target instanceof HTMLElement &&
			/^crypto.*button$/.test(event.target.id)
		) {
			return;
		}

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

				confirmCheckout(currency, chain, sender, planId, hash)
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
							body: "There was an error confirming your checkout.",
							variant: "error",
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
				cancelCheckout(from, to, parseEther(price).toString());
			}
		};

		try {
			if (!isConnected || !address || !chain) {
				throw new Error("Wallet is not connected");
			}
			assertPlanExists(plan);

			const checkout = await createCheckout(
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
						onClick={handleCrypto}
						title="Pay in crypto"
						description="Make a payment directly from your cryptocurrency wallet, in seconds."
						disabled={isDisabled}
						optional={
							<ConnectButton.Custom>
								{({
									account,
									chain,
									openAccountModal,
									openChainModal,
									openConnectModal,
									mounted,
								}) => {
									if (!account || !mounted) {
										return (
											<Button
												id="crypto_connect_button"
												pattern="tertiary"
												onClick={openConnectModal}
												disabled={isDisabled}
											>
												Connect wallet
											</Button>
										);
									}
									return (
										<div className={styles.inlineButtons}>
											<Button
												id="crypto_chain_button"
												pattern="tertiary"
												onClick={openChainModal}
												disabled={isDisabled}
											>
												{chain?.name}
											</Button>
											<Button
												id="crypto_account_button"
												pattern="tertiary"
												onClick={openAccountModal}
												disabled={isDisabled}
											>
												{account.displayBalance}{" "}
												{account.address.slice(0, 4)}...
												{account.address.slice(-4)}
											</Button>
										</div>
									);
								}}
							</ConnectButton.Custom>
						}
					/>
					<Card
						onClick={handleStripe}
						title="Pay with Visa/MasterCard/, $USD"
						description="Payment of bills in dollars, debit and credit cards by stripe."
						disabled={isDisabled}
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
	onClick: MouseEventHandler<HTMLButtonElement>;
	disabled: boolean;
	title: string;
	description: string;
	optional?: JSX.Element;
}> = ({ onClick, disabled, title, description, optional }) => {
	return (
		<Button
			className={styles.card}
			pattern="tertiary"
			onClick={onClick}
			disabled={disabled}
		>
			<div>{title}</div>
			<div className={styles.description}>{description}</div>
			{optional}
		</Button>
	);
};
