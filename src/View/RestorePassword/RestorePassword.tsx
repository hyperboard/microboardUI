import { Input } from "shared/ui-lib/Input";
import React, { useRef, useState } from "react";
import styles from "./RestorePassword.module.css";
import { Button } from "shared/ui-lib/Button";
import {
	Link as RRDLink,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import { getApiUrl } from "Config";
import { useTranslation } from "react-i18next";
import { Link } from "shared/ui-lib/Link";
import { Tail } from "View/AuthView/Tail";
import { PasswordChanged } from "View/Widgets/form-notifications/password-changed";

export const RestorePassword: React.FC = () => {
	const { t } = useTranslation();
	const [isDisabled, setIsDisabled] = useState(true);
	const [newPassError, setNewPassError] = useState<string>("");
	const [error, setError] = useState<string>("");
	const formRef = useRef<HTMLFormElement>(null);
	const [searchParams, _] = useSearchParams();
	const [isPasswordChanged, setIsPasswordChanged] = useState<boolean>(false);
	const navigate = useNavigate();

	const checkForm = (): void => {
		const form = formRef.current;
		if (!form) {
			setIsDisabled(true);
			setError("");
			return;
		}
		const newPassword = form?.newPassword?.value;
		const repeatedPassword = form?.repeatedPassword?.value;
		if (!newPassword || !repeatedPassword) {
			setIsDisabled(true);
			setError("");
			return;
		}

		const MIN_PASSWORD_LENGTH = 8;

		if (repeatedPassword.length < MIN_PASSWORD_LENGTH) {
			setIsDisabled(true);
			setError("");
			return;
		}

		if (newPassword !== repeatedPassword) {
			setIsDisabled(true);
			setError(t("auth.passwordDontAMatch"));
			return;
		}
		setError("");
		setIsDisabled(false);
	};

	const checkNewPassword = (): void => {
		const form = formRef.current;
		if (!form) {
			setIsDisabled(true);
			return;
		}
		const newPassword = form?.newPassword?.value;

		const MIN_PASSWORD_LENGTH = 8;

		if (newPassword.length < MIN_PASSWORD_LENGTH) {
			setIsDisabled(true);
			return;
		}

		setNewPassError("");
	};

	const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const form = formRef.current;

		if (!form) {
			return;
		}

		if (!searchParams.get("token")) {
			return;
		}

		fetch(getApiUrl("/auth/password/restore"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token: searchParams.get("token")!,
				newPassword: form.newPassword.value,
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
			.then(() => {
				setIsPasswordChanged(true);
			})
			.catch(error => {
				if (`${error?.status}` === "409") {
					setError(t("auth.passwordMustBeDifferent"));
					return;
				}
				setError(error?.message || "Unhandled error");
			});
	};

	if (isPasswordChanged) {
		return (
			<div className={styles.passwordChanged}>
				<PasswordChanged />
				<Button>{t("auth.backToLogIn")}</Button>
			</div>
		);
	}

	if (!searchParams.get("token")) {
		console.log("token not provided", searchParams);

		return (
			<div>
				<p className={styles.error}>
					{t("auth.restorationTokenIsNotProvided")}
				</p>
				<Link to="/auth/forgot-password">
					{t("auth.restorePassword")}
				</Link>
				<Button>
					<RRDLink to="/auth/sign-in" className={styles.link}>
						{t("common.backToMain")}
					</RRDLink>
				</Button>
			</div>
		);
	}

	return (
		<div>
			<form ref={formRef} className={styles.form} onSubmit={onSubmit}>
				<h1 className={styles.title}>{t("auth.resetPassword")}</h1>
				<div className={styles.inputs}>
					<Input
						password
						label={t("auth.passwordMustBeDifferent")}
						placeholder={t("auth.newPassword")}
						id="newPassword"
						errorText={newPassError}
						hasError={!!newPassError.length}
						onBlur={() => {
							checkForm();
							checkNewPassword();
						}}
					/>
					<Input
						password
						placeholder={t("auth.newPassword")}
						id="repeatedPassword"
						onInput={checkForm}
						errorText={error}
						helperText={t("auth.passwordAtLeast")}
						hasError={!!error.length}
					/>
				</div>

				<div className={styles.btns}>
					<Button
						disabled={isDisabled}
						type="submit"
						className={styles.submit}
					>
						{t("auth.submit")}
						<Tail />
					</Button>
					<Button
						pattern="ghost"
						onClick={() => navigate("/auth/sign-in")}
					>
						{t("auth.backToLogIn")}
					</Button>
				</div>
			</form>
		</div>
	);
};
