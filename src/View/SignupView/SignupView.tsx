import { getApiUrl } from "Config";
import React, { useState } from "react";
import { Link, createSearchParams, useNavigate } from "react-router-dom";
import styles from "./SignupView.module.css";

type RegisterOkResponse = {
	id: number;
	email: string;
};

export const SignupView = (): React.ReactElement => {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
					pathname: '/verify',
					search: createSearchParams({
						userId: `${data.id}`,
						email: data.email,
					}).toString()
				});
			})
			.catch(error => {
				setErrorMessage(error.message);
			});
	};
	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit}>
				<h1 className={styles.title}>Sign up</h1>
				<label htmlFor="email" className="label">
					Email
				</label>
				<input
					name="email"
					id="email"
					type="text"
					placeholder="Email"
					className="input"
				/>
				<label htmlFor="password" className="label">
					Password
				</label>
				<input
					name="password"
					id="password"
					type="password"
					placeholder="Password"
					className="input"
				/>
				{errorMessage && <p className={styles.error}>{errorMessage}</p>}
				<button
					type="submit"
					style={{ marginTop: "8px" }}
					className="button"
				>
					Submit
				</button>
				<Link to={"/sign-in"} className={styles.link}>
					Sign in
				</Link>
			</form>
		</div>
	);
};
