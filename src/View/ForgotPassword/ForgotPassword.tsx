import { getApiUrl } from "Config";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "shared/hooks/useDebounce";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input";
import styles from "./ForgotPassword.module.css";
import { isEmail } from "lib/regex";
import { useNavigate } from "react-router-dom";
import { Tail } from "View/AuthView/Tail";
import { SuccessIcon } from "./SuccessIcon";

const requestPasswordRestoration = (email: string): Promise<any> => {
	const request = fetch(getApiUrl("/auth/password/restore/request"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email }),
	});

	return request;
};

export const ForgotPassword: React.FC = () => {
	const { t } = useTranslation();
	const formRef = useRef<HTMLFormElement>(null);
	const [requested, setRequested] = useState<boolean>(false);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [error, setError] = useState<string>("");
	const navigate = useNavigate();

	const checkForm = (): void => {
		if (!formRef.current) {
			return;
		}

		const email = formRef.current.email.value;

		if (!isEmail(email)) {
			setError(t("auth.notValidEmail"));
			setDisabled(true);
			return;
		}

		setDisabled(false);
		setError("");
		return;
	};

	const dbCheckForm = useDebounce(checkForm, 500);

	const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();

		if (!formRef.current) {
			return;
		}

		requestPasswordRestoration(formRef.current.email.value).then(() => {
			setRequested(true);
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
					onClick={() => navigate("/auth/sign-in")}
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
				onInput={dbCheckForm}
			/>
			<div className={styles.btns}>
				<Button
					type="submit"
					disabled={disabled}
					className={styles.submitBtn}
				>
					{t("auth.submit")} <Tail />
				</Button>
				<Button
					pattern="ghost"
					onClick={() => {
						navigate("/auth/sign-in");
					}}
				>
					{t("auth.backToLogIn")}
				</Button>
			</div>
		</form>
	);
};
