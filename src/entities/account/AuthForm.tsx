import React, {
	type FormEventHandler,
	type PropsWithChildren,
	forwardRef,
} from "react";
import { useTranslation } from "react-i18next";
import { OuterLink } from "shared/ui-lib/OuterLink";
import styles from "./AuthForm.module.css";
import { LoginWith } from "features/LoginWith/LoginWith";
import { WalletLoginButton } from "features/WalletLoginButton";
import { GoogleAuthBtn } from "features/GoogleAuthBtn";

type Props = PropsWithChildren<{
	onSubmit: FormEventHandler;
	title: string;
	id: string;
	showPolicies?: boolean;
	showAnotherAuthWay?: boolean;
}>;

export const AuthForm = forwardRef<HTMLFormElement, Props>(
	(
		{ onSubmit, title, id, children, showPolicies, showAnotherAuthWay },
		ref,
	) => {
		const { t, i18n } = useTranslation();
		return (
			<div className={styles.wrapper}>
				<form
					className={styles.form}
					id={id}
					onSubmit={onSubmit}
					ref={ref}
				>
					<h1 className={styles.title}>{title}</h1>
					{children}
				</form>
				{showAnotherAuthWay && (
					<div className={styles.anotherBtns}>
						<LoginWith />
						<WalletLoginButton />
						<GoogleAuthBtn />
					</div>
				)}
				{showPolicies && (
					<div className={styles.policy}>
						{t("auth.policyWith")}{" "}
						<OuterLink
							href={
								i18n.language === "ru"
									? window.location.origin +
										"/pdf/terms_conditions_ru.pdf"
									: window.location.origin +
										"/pdf/terms_conditions_en.pdf"
							}
							className={styles.policyLink}
						>
							{t("auth.termsAndConditions")}
						</OuterLink>{" "}
						{t("common.and")}{" "}
						<OuterLink
							href={
								i18n.language === "ru"
									? window.location.origin +
										"/pdf/privacy_policy_ru.pdf"
									: window.location.origin +
										"/pdf/privacy_policy_en.pdf"
							}
							className={styles.policyLink}
						>
							{t("auth.privacyPolicy")}
						</OuterLink>
					</div>
				)}
			</div>
		);
	},
);

// Set a display name for easier debugging
AuthForm.displayName = "AuthForm";
