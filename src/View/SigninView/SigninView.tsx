import React, { useRef, useState } from "react";
import styles from "./SigninView.module.css";
import { Link as RRDLink, useNavigate } from "react-router-dom";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui-lib/Input/Input";
import { Tail } from "View/AuthView/Tail";
import { EmailIcon } from "View/SignupView/EmailIcon";
import { LockIcon } from "View/SignupView/LockIcon";
import { Button } from "shared/ui-lib/Button";
import { useDebounce } from "shared/hooks/useDebounce";
import { isEmail } from "lib/regex";

type RegisterOkResponse = {
	accessToken: string;
	refreshToken: string;
};

export const SigninView = (): React.ReactElement => {
	const { t } = useTranslation();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const navigate = useNavigate();
	const formRef = useRef<HTMLFormElement>(null);
	const [emailError, setEmailError] = useState<string>("");

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();

		fetch(getApiUrl("/auth/login"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: event.currentTarget.email.value,
				password: event.currentTarget.password.value,
			}),
		})
			.then(async response => {
				if (response.ok) {
					return response.json();
				} else {
					const data = await response.json();
					return Promise.reject(data);
				}
			})
			.then((data: RegisterOkResponse) => {
				Cookies.set("accessToken", data.accessToken, { secure: true });
				Cookies.set("refreshToken", data.refreshToken, {
					secure: true,
				});
				navigate("/dashboard");
			})
			.catch(error => {
				setErrorMessage(error.message);
			});
	};

	const checkForm = () => {
		const form = formRef.current;
		const email = form?.email.value;
		const password = form?.password.value;

		if (!email || !password) {
			setSubmitDisabled(true);
			return;
		}

		if (!isEmail(email)) {
			setSubmitDisabled(true);
			setEmailError(t("auth.notValidEmail"));
			return;
		}

		setEmailError("");
		setSubmitDisabled(false);
	};

	const dbCheckForm = useDebounce(checkForm, 500);

	return (
		<div className={styles.wrapper}>
			<form
				className={styles.form}
				id="signin-form"
				onSubmit={onSubmit}
				ref={formRef}
			>
				<h1 className={styles.title}>{t("auth.signIn")}</h1>
				<Input
					id="email"
					prefixIcon={<EmailIcon />}
					placeholder="Your email"
					hasError={!!emailError.length}
					errorText={emailError}
					onInput={dbCheckForm}
				/>
				<Input
					id="password"
					prefixIcon={<LockIcon />}
					placeholder="Password"
					password
					onInput={dbCheckForm}
				/>

				{errorMessage && <p className={styles.error}>{errorMessage}</p>}
				<div className={styles.btns}>
					<Button
						type="submit"
						style={{ marginTop: "8px" }}
						disabled={submitDisabled}
					>
						{t("auth.submit")}
						<Tail />
					</Button>

					<Button
						pattern="secondary"
						className={styles.forgot}
						onClick={() => navigate("/auth/forgot-password")}
					>
						{t("auth.forgotPassword")}
					</Button>

					<Button
						pattern="ghost"
						onClick={() => navigate("/auth/sign-up")}
					>
						{t("auth.signUpForFree")}
					</Button>
				</div>
			</form>
		</div>
	);
};
