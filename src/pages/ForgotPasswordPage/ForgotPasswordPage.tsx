import { getApiUrl } from "Config";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input";
import styles from "./ForgotPasswordPage.module.css";
import { isEmail } from "shared/lib/regex";
import { useNavigate } from "react-router-dom";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { SuccessIcon } from "./SuccessIcon";

export const ForgotPasswordPage: React.FC = () => {
	const { t } = useTranslation();
	const formRef = useRef<HTMLFormElement>(null);
	const [requested, setRequested] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const navigate = useNavigate();

	const checkForm = (): boolean => {
		if (!formRef.current) {
			return false;
		}

		const email = formRef.current.email.value;

		if (!isEmail(email)) {
			// setError(t("auth.enterAValidEmailAddress"));
			setDisabled(true);
			return false;
		}

		setDisabled(false);
		setError("");
		return true;
	};

	const checkFormWithError = (): void => {
		const isFormError = checkForm();

		if (!isFormError) {
			setError(t("auth.enterAValidEmailAddress"));
		} else {
			setError("");
		}
	};

	const dbCheckForm = checkForm;

	const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();

		if (!formRef.current) {
			return;
		}
		setDisabled(true);
		setIsSubmitLoading(true);
		fetch(getApiUrl("/auth/password/restore/request"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email: formRef.current.email.value || "" }),
		})
			.then(async response => {
				if (response.ok) {
					return response.json();
				} else {
					const data = await response.json();
					return Promise.reject(data);
				}
			})
			.then(() => {
				setRequested(true);
			})
			.catch(error => {
				if (error?.message === "User not found") {
					setError(t("auth.userNotFound"));
					return;
				}
			})
			.finally(() => {
				setDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	if (requested) {
		return (
			<div className={styles.requested}>
				<div>
					<SuccessIcon />
				</div>
				<h1 className={styles.resetPassword}>
					{t("auth.resetPassword")}
				</h1>
				<p className={styles.resetPasswordParagraph}>
					{t("auth.requestReceivedSuccessfully")}
				</p>
				<Button
					onClick={() => navigate(`/auth/sign-in${location.search}`)}
					className={styles.backToLogin}
				>
					{t("auth.backToLogIn")}
				</Button>
			</div>
		);
	}

	return (
		<form ref={formRef} onSubmit={onSubmit}>
			<h1 className={styles.title}>{t("auth.forgotPassword")}</h1>
			<Input
				id="email"
				label={t("auth.enterEmailForLink")}
				placeholder={t("auth.emailPlaceholder")}
				hasError={!!error.length}
				errorText={error}
				onBlur={checkFormWithError}
				onInput={dbCheckForm}
			/>
			<div className={styles.btns}>
				<Button
					type="submit"
					disabled={disabled}
					className={styles.submitBtn}
					loading={isSubmitLoading}
				>
					{t("auth.submit")} <Tail />
				</Button>
				<Button
					pattern="ghost"
					onClick={() => {
						navigate(`/auth/sign-in${location.search}`);
					}}
				>
					{t("auth.backToLogIn")}
				</Button>
			</div>
		</form>
	);
};
