import { ConnectButton } from "@rainbow-me/rainbowkit";
import { injected } from "@wagmi/connectors";
import { useAccount } from "App/useAccount";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { notify } from "shared/ui-lib/Toast";
import { Tooltip } from "shared/ui-lib/Tooltip";
import { UiButton } from "shared/ui-lib/UiButton";
import {
	useConnect,
	useDisconnect,
	useSignMessage,
	useAccount as useWalletAccount,
} from "wagmi";
import styles from "./WalletLoginButton.module.css";

interface WalletLoginButtonProps {}

const WalletLoginButton: React.FC<WalletLoginButtonProps> = () => {
	const { t } = useTranslation();
	const { address } = useWalletAccount();
	const account = useAccount();
	const { connectAsync, error } = useConnect();
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
			console.error(err);
			notify({
				variant: "error",
				header: t("auth.signinNotifyError.title"),
				body: t("auth.signinNotifyError.crypto"),
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
