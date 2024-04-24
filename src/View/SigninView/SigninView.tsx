import React, { useState } from "react";
import styles from "./SigninView.module.css";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

type RegisterOkResponse = {
	accessToken: string;
	refreshToken: string;
};

export const SigninView = (): React.ReactElement => {
	const { t } = useTranslation();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const navigate = useNavigate();
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
	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit}>
				<h1 className={styles.title}>{t("auth.signIn")}</h1>
				<label htmlFor="email" className="label">
					{t("auth.email")}
				</label>
				<input
					name="email"
					id="email"
					type="text"
					placeholder="Email"
					className="input"
				/>
				<label htmlFor="password" className="label">
					{t("auth.password")}
				</label>
				<input
					name="password"
					id="password"
					type="password"
					placeholder={t("auth.passwordPlaceholder")}
					className="input"
				/>
				{errorMessage && <p className={styles.error}>{errorMessage}</p>}
				<button
					type="submit"
					style={{ marginTop: "8px" }}
					className="button"
				>
					{t("auth.submit")}
				</button>
				<Link to={"/sign-up"} className={styles.link}>
					{t("auth.signUp")}
				</Link>
			</form>
		</div>
	);
};
