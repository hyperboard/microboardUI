import { getApiUrl } from "Config";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, createSearchParams, useNavigate } from "react-router-dom";
import styles from "./SignupView.module.css";

type RegisterOkResponse = {
	id: number;
	email: string;
};

export const SignupView = (): React.ReactElement => {
	const { t } = useTranslation();
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
	const navigate = useNavigate();
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
			.then((data: RegisterOkResponse) => {
				navigate({
					pathname: "/verify",
					search: createSearchParams({
						userId: `${data.id}`,
						email: data.email,
					}).toString(),
				});
			})
			.catch(error => {
				setErrorMessage(error.message);
			});
	};
	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit}>
				<h1 className={styles.title}>{t("auth.signUp")}</h1>
				<label htmlFor="email" className="label">
					{t("auth.email")}
				</label>
				<input
					name="email"
					id="email"
					type="text"
					placeholder={t("auth.emailPlaceholder")}
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
				<Link to={"/sign-in"} className={styles.link}>
					{t("auth.signIn")}
				</Link>
			</form>
		</div>
	);
};
