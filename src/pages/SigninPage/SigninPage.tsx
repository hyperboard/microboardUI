import { LAST_BOARD_KEY_QS } from "App/App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { AuthForm } from "entities/account";
import { GoogleAuthBtn } from "features/GoogleAuthBtn/GoogleAuthBtn";
import { LoginWith } from "features/LoginWith/LoginWith";
import { WalletLoginButton } from "features/WalletLoginButton";
import { Tail } from "pages/layouts/AuthLayout/Tail";
import { EmailIcon } from "pages/SignupPage/EmailIcon";
import { LockIcon } from "pages/SignupPage/LockIcon";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { isEmail } from "shared/lib/regex";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input/Input";
import styles from "./SigninPage.module.css";

export const SigninPage: React.FC = (): React.ReactElement => {
	const { t } = useTranslation();
	// const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const navigate = useNavigate();
	const formRef = useRef<HTMLFormElement>(null);
	const [emailError, setEmailError] = useState<string>("");
	const [errorText, setErrorText] = useState<string>("");
	const account = useAccount();
	const boards = useBoardsList();

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();

		const form = formRef.current;
		const email = form?.email.value;
		const password = form?.password.value;
		const searchParams = createSearchParams(window.location.search);

		setIsSubmitLoading(true);
		setSubmitDisabled(true);
		account
			.login(email, password)
			.then(async () => {
				setErrorText("");
				if (searchParams.get("backToSelect") === "true") {
					navigate("/selectBoard");
				} else if (localStorage.getItem(LAST_BOARD_KEY_QS)) {
					navigate(
						`/boards/${localStorage.getItem(LAST_BOARD_KEY_QS)}`,
					);
				} else {
					const boardId = await boards.createBoard();
					if (boardId) {
						navigate(`/boards/${boardId}`);
					}
				}
				await account.fetchAccountInfo();
				await account.onLogin?.();
			})
			.catch(error => {
				// setErrorMessage(error.message);
				console.log(error);
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
		<AuthForm
			title={t("auth.signIn")}
			id="signin-form"
			onSubmit={onSubmit}
			ref={formRef}
			showPolicies
		>
			<Input
				id="email"
				prefixIcon={<EmailIcon />}
				placeholder={t("auth.emailPlaceholder")}
				hasError={!!emailError.length}
				errorText={emailError}
				onBlur={() => {
					checkEmail();
				}}
			/>
			<Input
				id="password"
				prefixIcon={<LockIcon />}
				placeholder={t("auth.passwordPlaceholder")}
				password
				onInput={dbCheckForm}
				errorText={errorText}
				hasError={!!errorText}
			/>

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
					onClick={() =>
						navigate(`/auth/forgot-password${location.search}`)
					}
				>
					{t("auth.forgotPassword")}
				</Button>

				<Button
					pattern="ghost"
					onClick={() => navigate(`/auth/sign-up${location.search}`)}
				>
					{t("auth.signUpForFree")}
				</Button>

				<LoginWith />
				<WalletLoginButton />
				<GoogleAuthBtn />
			</div>
		</AuthForm>
	);
};
