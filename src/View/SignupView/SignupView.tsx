import { getApiUrl } from "Config";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Link as RRDLink,
	createSearchParams,
	useNavigate,
} from "react-router-dom";
import styles from "./SignupView.module.css";
import { Input } from "shared/ui-lib/Input/Input";
import { Tail } from "View/AuthView/Tail";
import { EmailIcon } from "./EmailIcon";
import { LockIcon } from "./LockIcon";
import { useDebounce } from "shared/hooks/useDebounce";
import { Link } from "shared/ui-lib/Link";
import { Button } from "shared/ui-lib/Button";
import isEmail from "validator/lib/isEmail";

type RegisterOkResponse = {
	id: number;
	email: string;
};

export const SignupView = (): React.ReactElement => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formRef = React.useRef<HTMLFormElement>(null);
	const [isDisabled, setIsDisabled] = useState(true);
	const [error, setError] = useState<string>("");

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();

		fetch(getApiUrl("/auth/register"), {
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
			.catch(error => {
				if (`${error?.status}` === "409") {
					setError(t("auth.userAlreadyExists"));
				}
			})
			.then((data: RegisterOkResponse) => {
				navigate({
					pathname: "/auth/verify",
					search: createSearchParams({
						userId: `${data.id}`,
						email: data.email,
					}).toString(),
				});
			})
			.catch(error => {
				// setErrorMessage(error.message);
			});
	};

	const checkForm = (): void => {
		const form = formRef.current;
		if (!form) {
			setIsDisabled(true);
			return;
		}
		const email = form?.email?.value;
		const password = form?.password?.value;
		if (!email || !password) {
			setError("");
			setIsDisabled(true);
			return;
		}

		if (!isEmail(email)) {
			setIsDisabled(true);
			setError(t("auth.notValidEmail"));
			return;
		}

		const MIN_PASSWORD_LENGTH = 8;
		const MAX_PASSWORD_LENGTH = 14;
		if (
			password.length < MIN_PASSWORD_LENGTH ||
			password.length > MAX_PASSWORD_LENGTH
		) {
			setIsDisabled(true);
			setError(t("auth.passwordLengthError"));
			return;
		}
		setError("");
		setIsDisabled(false);
	};

	const dbCheckForm = checkForm;

	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit} ref={formRef}>
				<h1 className={styles.title}>{t("auth.signUpForFree")}</h1>
				<Input
					prefixIcon={<EmailIcon />}
					id="email"
					type="text"
					placeholder={t("auth.emailPlaceholder")}
					onInput={dbCheckForm}
					hasError={!!error}
				/>
				<Input
					prefixIcon={<LockIcon />}
					id="password"
					errorText={error}
					password
					hasError={!!error}
					placeholder={t("auth.passwordPlaceholder")}
					helperText={t("auth.passwordAtLeast")}
					onInput={dbCheckForm}
				/>
				<div className={styles.btns}>
					<Button
						type="submit"
						style={{ marginTop: "8px" }}
						disabled={isDisabled}
					>
						{t("auth.submit")}
						<Tail />
					</Button>
					<Button
						pattern="ghost"
						onClick={() => {
							navigate("/auth/sign-in");
						}}
						className={styles.login}
					>
						{t("auth.signIn")}
					</Button>
				</div>
			</form>
			<div className={styles.policy}>
				{t("auth.policyWith")}{" "}
				<Link to="#" className={styles.policyLink}>
					{t("auth.termsAndConditions")}
				</Link>{" "}
				{t("common.and")}{" "}
				<Link to="#" className={styles.policyLink}>
					{t("auth.privacyPolicy")}
				</Link>
			</div>
		</div>
	);
};
