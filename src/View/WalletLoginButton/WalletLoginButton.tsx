import React from "react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import {
	useAccount as useWalletAccount,
	useSignMessage,
	useConnect,
	useDisconnect,
} from "wagmi";
import { Button } from "shared/ui-lib/Button";
import { useTranslation } from "react-i18next";
import { wagmiConfig } from "View/ContextWrapper";
import { injected } from "@wagmi/connectors";
import { api } from "shared/api";
import { UniqueString } from "shared/api/auth";
import { useAccount } from "App/useAccount";
import { notify } from "View/Ui/Toast";

interface WalletLoginButtonProps {}

const WalletLoginButton: React.FC<WalletLoginButtonProps> = () => {
	const { t } = useTranslation();
	const { address, isConnected, status } = useWalletAccount();
	const account = useAccount();
	const { openConnectModal } = useConnectModal();
	const { connectAsync, connectors } = useConnect();
	const { disconnectAsync } = useDisconnect();
	const { signMessageAsync } = useSignMessage();

	const handleLogin = async (): Promise<void> => {
		try {
			const res = await connectAsync({ connector: injected() });
			if (!res) {
				throw new Error("Failed connecting wallet");
			}

			const nonce = await account.getNonce(res.accounts[0]);
			if (!nonce) {
				throw new Error("Failed to fetch nonce");
			}

			console.log("nonce", nonce);
			const signature = await signMessageAsync({ message: nonce });
			const verified = await account.verifySignature(
				res.accounts[0],
				signature,
			);
			console.log("verified", verified);
		} catch (err) {
			notify({
				variant: "error",
				header: "Error while logging in",
				body: err instanceof Error ? err.message : "Unexpected error",
			});
			disconnectAsync();
		}
		// if (!address && openConnectModal) {
		//     openConnectModal()
		// }  else {
		//     const message = t("auth.cyrptoSignInMsg");
		//     const signature = await signMessageAsync({ message });
		//     console.log("SIGNATURE", signature);
		//     console.log("address", address);
		// }
	};

	return (
		<ConnectButton.Custom>
			{({ openConnectModal }) => (
				<Button pattern="ghost" onClick={handleLogin} type="button">
					{t("auth.cryptoSignIn")}
					{!address && ` (${t("auth.connectWallet")})`}
				</Button>
			)}
		</ConnectButton.Custom>
	);
};

export default WalletLoginButton;
