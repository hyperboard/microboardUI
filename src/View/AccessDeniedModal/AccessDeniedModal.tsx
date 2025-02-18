import { useAccount } from "App/useAccount";
import { UiModal } from "View/Ui/UiModal/UiModal";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Link } from "shared/ui-lib/Link";
import styles from "./AccessDeniedModal.module.css";

export const ACCESS_DENIED_MODAL = Symbol("accessDeniedModal");

export function AccessDeniedModal(): JSX.Element {
	const account = useAccount();
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<UiModal modalId={ACCESS_DENIED_MODAL}>
			<div className={styles.wrapper}>
				<h1 className={styles.heading}>{t("sharing.accessDenied")}</h1>
				<div className={styles.msg}>
					<p>
						{t("sharing.privateBoard")}{" "}
						{account.isLoggedIn
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
				</div>
				{!account.isLoggedIn && (
					<Button
						className={styles.btn}
						onClick={() => navigate("/auth/sign-in")}
					>
						{t("auth.signIn")}
					</Button>
				)}
			</div>
		</UiModal>
	);
}
