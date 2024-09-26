import { App } from "App";
import { LAST_BOARD_KEY_QS } from "App/App";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { isEmail } from "lib/regex";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input/Input";
import { OuterLink } from "shared/ui-lib/OuterLink";
import { Tail } from "View/AuthView/Tail";
import { EmailIcon } from "View/SignupView/EmailIcon";
import { LockIcon } from "View/SignupView/LockIcon";
import styles from "./SigninView.module.css";

type RegisterOkResponse = {
	accessToken: string;
	refreshToken: string;
};

interface Props {
	app: App;
}

export const SigninView: React.FC<Props> = ({ app }): React.ReactElement => {
	const { t } = useTranslation();
	// const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const navigate = useNavigate();
	const formRef = useRef<HTMLFormElement>(null);
	const [emailError, setEmailError] = useState<string>("");
	const [errorText, setErrorText] = useState<string>("");

	const searchParams = new URLSearchParams(location.search);

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();

		const form = formRef.current;
		const email = form?.email.value;
		const password = form?.password.value;

		setIsSubmitLoading(true);
		setSubmitDisabled(true);
		fetch(getApiUrl("/auth/login"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				password: password,
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
			.then(async (data: RegisterOkResponse) => {
				Cookies.set("accessToken", data.accessToken, { secure: true });
				Cookies.set("refreshToken", data.refreshToken, {
					secure: true,
				});
				setErrorText("");
				if (searchParams.get("backToSelect") === "true") {
					await app.storage.fetchBoards();
					navigate("/selectBoard");
				} else if (localStorage.getItem(LAST_BOARD_KEY_QS)) {
					navigate(
						`/boards/${localStorage.getItem(LAST_BOARD_KEY_QS)}`,
					);
				} else {
					const boardId = await app.createPublicBoard();
					if (boardId) {
						navigate(`/boards/${boardId}`);
					}
				}
			})
			.then(() => {
				app.storage.claimBoards();
			})
			.catch(error => {
				// setErrorMessage(error.message);
				console.log(
					"sign in error:",
					error?.message === "User not activated",
				);
				if (error?.message === "User not activated") {
					const form = formRef.current;
					const email = form?.email.value;
					navigate({
						pathname: "/auth/verify",
						search: createSearchParams({
							...Object.fromEntries(searchParams),
							email: email,
						}).toString(),
					});
				} else {
					setErrorText(t("auth.incorrectEmailOrPassword"));
				}
			})
			.finally(() => {
				setIsSubmitLoading(false);
				setSubmitDisabled(false);
			});
	};

	const checkEmail = (): boolean => {
		const email = formRef.current?.email.value;
		if (!isEmail(email)) {
			setEmailError(t("auth.enterAValidEmailAddress"));
			return false;
		}
		setEmailError("");
		return true;
	};

	const checkForm = (): void => {
		const form = formRef.current;
		const email = form?.email.value;
		const password = form?.password.value;

		if (!email || !password) {
			setErrorText("");
			setEmailError("");
			setSubmitDisabled(true);
			if (email && !checkEmail()) {
				return;
			}
			return;
		}

		if (!isEmail(email)) {
			setSubmitDisabled(true);
			setEmailError(t("auth.enterAValidEmailAddress"));
			return;
		}

		setEmailError("");
		setSubmitDisabled(false);
	};

	const dbCheckForm = checkForm;

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
					onBlur={() => {
						checkEmail();
					}}
				/>
				<Input
					id="password"
					prefixIcon={<LockIcon />}
					placeholder="Password"
					password
					onInput={dbCheckForm}
					errorText={errorText}
					hasError={!!errorText}
				/>

				{/* {errorMessage && <p className={styles.error}>{errorMessage}</p>} */}
				<div className={styles.btns}>
					<Button
						type="submit"
						disabled={submitDisabled}
						loading={isSubmitLoading}
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

			<div className={styles.policy}>
				{t("auth.policyWith")}{" "}
				<OuterLink
					href="https://microboard.ru/terms"
					className={styles.policyLink}
				>
					{t("auth.termsAndConditions")}
				</OuterLink>{" "}
				{t("common.and")}{" "}
				<OuterLink
					href="https://microboard.ru/personal"
					className={styles.policyLink}
				>
					{t("auth.privacyPolicy")}
				</OuterLink>
			</div>
		</div>
	);
};
