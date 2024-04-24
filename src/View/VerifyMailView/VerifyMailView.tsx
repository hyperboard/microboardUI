import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./VerifyMailView.module.css";

const secondsToHumanReadable = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const resendEmail = async (email: string, userId: number): Promise<any> => {
	return fetch(getApiUrl("/auth/resendEmail"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, userId }),
	})
		.then(data => {
			return data.json();
		})
		.then(data => {
			if (data?.status >= 300) {
				return Promise.reject(data);
			}
			return data;
		});
};

const verifyEmail = async (userId: number, passcode: string): Promise<any> => {
	return fetch(getApiUrl("/auth/verify"), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ userId, passcode }),
	})
		.then(data => {
			return data.json();
		})
		.then(data => {
			if (data?.status >= 300) {
				return Promise.reject(data);
			}
			Cookies.set("accessToken", data.accessToken);
			Cookies.set("refreshToken", data.refreshToken);
			return data;
		});
};

export const VerifyMailView: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams, _setSearchParams] = useSearchParams();
	const [retryCount, setRetryCount] = useState(0);
	const navigate = useNavigate();
	const [passcode, setPasscode] = useState<string>("");
	const [error, setError] = useState<string>("");

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		if (!searchParams.get("userId")) {
			return;
		}
		if (searchParams.get("userId")) {
			verifyEmail(parseInt(searchParams.get("userId") || "0"), passcode)
				.then(() => {
					console.log("verifyEmail ok");
					navigate("/dashboard");
				})
				.catch(error => {
					setError(error?.message || t("auth.unknownError"));
					console.log("verifyEmail error:", error);
				});
		}
	};

	const onResend = async (): Promise<void> => {
		if (!searchParams.get("userId") || !searchParams.get("email")) {
			return;
		}
		resendEmail(
			searchParams.get("email") || "",
			parseInt(searchParams.get("userId") || ""),
		).catch(error => {
			setError(error?.message || t("auth.unknownError"));
		});
		setRetryCount(60);
	};

	useEffect(() => {
		if (!searchParams.get("userId") || !searchParams.get("email")) {
			return;
		}
		if (!searchParams.get("passcode")) {
			return;
		}
		verifyEmail(
			parseInt(searchParams.get("userId") || "0"),
			searchParams.get("passcode") || "",
		)
			.then((data): void => {
				Cookies.set("accessToken", data.accessToken, { secure: true });
				Cookies.set("refreshToken", data.refreshToken, {
					secure: true,
				});
				navigate("/dashboard");
			})
			.catch(error => {
				setError(error?.message || t("auth.unknownError"));
			});
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (retryCount > 0) {
				setRetryCount(retryCount - 1);
			}
		}, 1000);

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	});

	return (
		<div className={styles.wrapper}>
			<form onSubmit={onSubmit} className={styles.form}>
				<label htmlFor="code" className={styles.title}>
					{t("auth.passcode")}
				</label>
				<input
					className={styles.input}
					type="text"
					id="code"
					name="code"
					maxLength={6}
					onInput={ev => setPasscode(ev.currentTarget.value)}
					value={passcode}
				/>
				<button
					disabled={retryCount > 0}
					type="button"
					onClick={onResend}
					className={styles.retryButton}
				>
					{t("auth.resendCode")}{" "}
					{retryCount > 0
						? `(${secondsToHumanReadable(retryCount)})`
						: null}
				</button>
				<button type="submit" className={styles.submit}>
					{t("auth.submit")}
				</button>
				{error && <p className={styles.error}>{error}</p>}
			</form>
		</div>
	);
};
