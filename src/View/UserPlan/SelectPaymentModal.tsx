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
import { useLocation } from "react-router-dom";
import { notify } from "View/Ui/Toast";
import { billingApi } from "shared/api";
import { useAccount } from "App/useAccount";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";

import { useSendTransaction, useAccount as useWalletAccount } from "wagmi";
import { parseEther } from "viem";
import { api } from "shared/api";
import "@rainbow-me/rainbowkit/styles.css";
import clsx from "clsx";

export const SELECT_PAYMENT_MODAL_ID = Symbol("selectPaymentModal");

type CryptoCheckout = {
	price: string;
	symbol: string;
	address: string;
};

async function createCheckout(
	currency: string,
	chain: string,
	sender: string,
): Promise<null | CryptoCheckout> {
	if (!currency) {
		console.error("Invalid currency code provided.");
		return null;
	}

	const url = `/crypto/checkout`;
	const body = { symbol: currency, chain, sender, planId: "plus" };

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

	const res = await api.delete(url, undefined, body);
}

export function SelectPaymentModal(): JSX.Element {
	const { openModal } = useUiModalContext();
	const location = useLocation();
	const account = useAccount();
	const { t } = useTranslation();
	const [isDisabled, setIsDisabled] = useState(false);
	const [plan, setPlan] = useState<billingApi.Plan | null>(null);

	const { openConnectModal } = useConnectModal();
	const { sendTransaction } = useSendTransaction();
	const { address, isConnected, chain } = useWalletAccount();

	const cryptoCardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		billingApi.getPlans().then(({ data }) => {
			const plusPlan = data?.find(({ id }) => id === "plus");

			setPlan(plusPlan ?? null);
		});
	}, [account.isLoggedIn]);

	const handleOpenPlans: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(USER_PLAN_MODAL_ID);
	};

	const handleStripe = async (): Promise<void> => {
		const successUrl = `${window.location.href}?paymentStatus=success`;
		const cancelUrl = `${window.location.href}?paymentStatus=error`;

		try {
			if (!plan) {
				throw new Error();
			}

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

	const handleCrypto = async (
		event: React.MouseEvent<HTMLDivElement>,
	): Promise<void> => {
		const children = Array.from(cryptoCardRef.current?.children || []);
		if (
			!(
				cryptoCardRef.current &&
				cryptoCardRef.current === event.currentTarget &&
				(event.target === event.currentTarget ||
					(children[0] && event.target === children[0]))
			)
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

		const onSuccess = (_hash: `0x${string}`): void => {
			setIsDisabled(false);
			notify({
				header: "Transaction Successful",
				body: "Your transaction was completed successfully, wait for confirmations",
				variant: "success",
			});
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
			if (!isConnected || !address) {
				throw new Error("Wallet is not connected");
			}

			const checkout = await createCheckout(
				chain?.nativeCurrency.symbol || "",
				chain?.name || "",
				address,
			);
			if (!checkout) {
				throw new Error("Could not create checkout");
			}

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
					onSuccess: onSuccess,
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
		<UiModal modalId={SELECT_PAYMENT_MODAL_ID}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>Payment</h1>
				<div className={styles.cards}>
					<div
						className={clsx(
							styles.card,
							isDisabled && styles.disabled,
						)}
						onClick={handleCrypto}
						ref={cryptoCardRef}
					>
						Pay in crypto
						<div className={styles.description}>
							Make a payment directly from your cryptocurrency
							wallet, in seconds.
						</div>
						{!isConnected && (
							<Button
								pattern="primary"
								onClick={openConnectModal}
							>
								Connect wallet
							</Button>
						)}
						{isConnected && (
							<span>
								<ConnectButton />
							</span>
						)}
					</div>
					<div
						className={clsx(
							styles.card,
							isDisabled && styles.disabled,
						)}
						onClick={handleStripe}
					>
						Pay with Visa/MasterCard/, $USD
						<div className={styles.description}>
							Payment of bills in dollars, debit and credit cards
							by stripe.
						</div>
					</div>
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
