import { useAccount } from "App/useAccount";
import { PROFILE_SETTINGS_MODAL_ID } from "features/ProfileSettingsModal";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Link } from "shared/ui-lib/Link";
import { UiButton } from "shared/ui-lib/UiButton";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import styles from "./AccessDeniedModal.module.css";

export const ACCESS_DENIED_MODAL = Symbol("accessDeniedModal");

export function AccessDeniedModal(): JSX.Element {
	const account = useAccount();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { openModal } = useUiModalContext();

	const isEmailAccount = Boolean(account.info?.email);

	return (
		<UiModal modalId={ACCESS_DENIED_MODAL} renderAsPageOnMobile={false}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("sharing.accessDenied")}</h1>
				<div className={styles.msg}>
					<p>
						{t("sharing.privateBoard")}{" "}
						{account.isLoggedIn && isEmailAccount
							? t("sharing.requestAccessMsg")
							: ""}
					</p>
					{account.isLoggedIn ? (
						<p>
							<Trans
								t={t}
								i18nKey={
									account.info?.address
										? "sharing.loggedInCrypto"
										: "sharing.loggedIn"
								}
							>
								You are logged in to your
								<span className={styles.link}>
									{{
										account:
											account.info?.email ||
											account.info?.address,
									}}
								</span>{" "}
								account.
							</Trans>
						</p>
					) : (
						<p>
							{t("sharing.notAuthMsg")}{" "}
							<Link to="/auth/sign-in" className={styles.link}>
								{t("sharing.login")}
							</Link>{" "}
							{t("sharing.or")}{" "}
							<Link to="/auth/sign-up" className={styles.link}>
								{t("sharing.register")}
							</Link>
							.
						</p>
					)}
					{account.isLoggedIn && !isEmailAccount && (
						<p>{t("sharing.privateBoardCrypto")}</p>
					)}
				</div>
				{!account.isLoggedIn && (
					<UiButton
						variant="primary"
						className={styles.btn}
						onClick={() => navigate("/auth/sign-in")}
						size="lg"
					>
						{t("auth.signIn")}
					</UiButton>
				)}
				{account.isLoggedIn && !account.info?.email && (
					<UiButton
						className={styles.btn}
						onClick={() => openModal(PROFILE_SETTINGS_MODAL_ID)}
						variant="primary"
						size="lg"
					>
						{t("userPanel.profileSettings")}
					</UiButton>
				)}
			</div>
		</UiModal>
	);
}
