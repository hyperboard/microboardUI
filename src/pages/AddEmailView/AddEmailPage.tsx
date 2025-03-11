import { useAccount } from "App/useAccount";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { UiButton } from "shared/ui-lib/UiButton";
import { Input } from "shared/ui-lib/Input/Input";
import isEmail from "validator/lib/isEmail";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import styles from "./AddEmailPage.module.css";
import { EmailIcon } from "pages/SignupPage/EmailIcon";

export const AddEmailPage = (): React.ReactElement => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formRef = React.useRef<HTMLFormElement>(null);
	const [isDisabled, setIsDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [emailError, setEmailError] = useState<string>("");
	const account = useAccount();

	const checkEmail = (): boolean => {
		const email = formRef.current?.email.value;
		if (!isEmail(email)) {
			setEmailError(t("auth.enterAValidEmailAddress"));
			return false;
		}
		setEmailError("");
		return true;
	};

	const checkForm = (): boolean => {
		const form = formRef.current;
		if (!form) {
			return false;
		}

		const email = form?.email?.value;
		if (!email) {
			setError("");
			setIsDisabled(true);
			if (email && !checkEmail()) {
				return false;
			}
			return false;
		}

		if (!isEmail(email)) {
			setIsDisabled(true);
			setEmailError(t("auth.enterAValidEmailAddress"));
			return false;
		}

		setError("");
		setEmailError("");
		setIsDisabled(false);
		return true;
	};

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		if (error) {
			return;
		}
		if (!checkForm()) {
			return;
		}
		setIsDisabled(true);
		setIsSubmitLoading(true);

		try {
			const added = await account.addEmail(formRef.current?.email?.value);
			navigate({
				pathname: "/bind-email/verify",
				search: createSearchParams({
					...Object.fromEntries(new URLSearchParams(location.search)),
					email: added,
				}).toString(),
			});
		} catch {
			setIsDisabled(false);
			setIsSubmitLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit} ref={formRef}>
				<h1 className={styles.title}>{t("auth.addEmail")}</h1>
				<Input
					prefixIcon={<EmailIcon />}
					id="email"
					type="text"
					placeholder={t("auth.emailPlaceholder")}
					onBlur={checkForm}
					hasError={!!emailError}
					errorText={emailError}
				/>

				<div className={styles.btns}>
					<UiButton
						type="submit"
						disabled={isDisabled}
						loading={isSubmitLoading}
						variant="primary"
						size="lg"
					>
						{t("auth.submit")}
						<Tail />
					</UiButton>
				</div>
			</form>
		</div>
	);
};
