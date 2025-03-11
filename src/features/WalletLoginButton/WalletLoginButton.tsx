import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
	useAccount as useWalletAccount,
	useSignMessage,
	useConnect,
	useDisconnect,
} from "wagmi";
import { UiButton } from "shared/ui-lib/UiButton";
import { useTranslation } from "react-i18next";
import { injected } from "@wagmi/connectors";
import { useAccount } from "App/useAccount";
import { notify } from "shared/ui-lib/Toast";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./WalletLoginButton.module.css";
import { Tooltip } from "shared/ui-lib/Tooltip";

interface WalletLoginButtonProps {}

const WalletLoginButton: React.FC<WalletLoginButtonProps> = () => {
	const { t } = useTranslation();
	const { address } = useWalletAccount();
	const account = useAccount();
	const { connectAsync } = useConnect();
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

			const signature = await signMessageAsync({ message: nonce });
			await account.verifySignature(res.accounts[0], signature);
		} catch (err) {
			notify({
				variant: "error",
				header: "Error while logging in",
				body: err instanceof Error ? err.message : "Unexpected error",
			});
			disconnectAsync();
		}
	};

	return (
		<ConnectButton.Custom>
			{() => (
				<UiButton
					variant="primary"
					onClick={handleLogin}
					className={styles.btn}
					size="lg"
				>
					<Icon iconName={"CryptoIcon"} />
					{t("auth.cryptoSignIn")}
					{!address && (
						<Tooltip
							tooltip={t("auth.connectWallet")}
							tooltipPosition="top"
							tooltipAlign="left"
						/>
					)}
				</UiButton>
			)}
		</ConnectButton.Custom>
	);
};

export default WalletLoginButton;
