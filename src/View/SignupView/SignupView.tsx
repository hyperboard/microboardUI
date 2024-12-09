import { useAccount } from "App/useAccount";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { createSearchParams, useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input/Input";
import { OuterLink } from "shared/ui-lib/OuterLink";
import isEmail from "validator/lib/isEmail";
import { Tail } from "View/AuthView/Tail";
import { EmailIcon } from "./EmailIcon";
import { LockIcon } from "./LockIcon";
import styles from "./SignupView.module.css";
import { PeopleIcon } from "./PeopleIcon";
import { Icon } from "View/Icon";

export const SignupView = (): React.ReactElement => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const formRef = React.useRef<HTMLFormElement>(null);
	const [showNameInput, setShowNameInput] = useState(true);
	const [username, setUsername] = useState("");
	const [isDisabled, setIsDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [emailError, setEmailError] = useState<string>("");
	const account = useAccount();

	const next = () => {
		if (isDisabled) {
			return;
		}

		setShowNameInput(false);
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

	const checkForm = (): boolean => {
		const form = formRef.current;
		if (!form) {
			setIsDisabled(true);
			return false;
		}
		const email = form?.email?.value;
		const password = form?.password?.value;
		if (!email || !password) {
			setError("");
			setIsDisabled(true);
			if (email && !checkEmail()) {
				return false;
			}
			return false;
		}

		if (!isEmail(email)) {
			setIsDisabled(true);
			setEmailError(t("auth.enterAValidEmailAddress"));
			return false;
		}

		const MIN_PASSWORD_LENGTH = 8;
		// const MAX_PASSWORD_LENGTH = 14;
		if (password.length < MIN_PASSWORD_LENGTH) {
			setIsDisabled(true);
			// setError(t("auth.passwordLengthError"));
			return false;
		}
		setError("");
		setEmailError("");
		setIsDisabled(false);
		return true;
	};

	const checkName = (val: string) => {
		if (val.length < 1) {
			setError("Name length too short, minimum 1 symbol");
			setIsDisabled(true);
			return;
		}
		setIsDisabled(false);
		setError("");
	};

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		checkName(username);
		if (!username || error) {
			return;
		} else {
			setShowNameInput(false);
		}
		if (!checkForm()) {
			return;
		}

		setIsDisabled(true);
		setIsSubmitLoading(true);

		account
			.register(
				event.currentTarget.email.value,
				event.currentTarget.password.value,
				username,
			)
			.then(res => res.data)
			.catch(error => {
				if (`${error?.status}` === "409") {
					setError(t("auth.userAlreadyExists"));
				}
			})
			.then(data => {
				if (data) {
					navigate({
						pathname: "/auth/verify",
						search: createSearchParams({
							...Object.fromEntries(
								new URLSearchParams(location.search),
							),
							userId: `${data.id}`,
							email: data.email,
						}).toString(),
					});
				}
			})
			.catch(error => {
				// setErrorMessage(error.message);
			})
			.finally(() => {
				setIsDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	// const dbCheckForm = checkForm;

	return (
		<div className={styles.wrapper}>
			<form className={styles.form} onSubmit={onSubmit} ref={formRef}>
				<h1 className={styles.title}>{t("auth.signUpForFree")}</h1>
				{showNameInput ? (
					<Input
						id="name"
						onChange={ev => {
							setUsername(ev.target.value);
							checkName(ev.target.value);
						}}
						prefixIcon={
							<Icon iconName="human" width={20} height={20} />
						}
						iconColor="rgba(13, 17, 38, 0.4)"
						placeholder={t("auth.name")}
						hasError={!!error}
						errorText={error}
						helperText={t("auth.nameDesc")}
					/>
				) : (
					<>
						<Input
							prefixIcon={<EmailIcon />}
							id="email"
							type="text"
							placeholder={t("auth.emailPlaceholder")}
							onBlur={checkForm}
							hasError={!!emailError}
							errorText={emailError}
						/>
						<Input
							prefixIcon={<LockIcon />}
							id="password"
							errorText={error}
							password
							hasError={!!error}
							placeholder={t("auth.passwordPlaceholder")}
							helperText={t("auth.passwordAtLeast")}
							onInput={checkForm}
						/>
					</>
				)}

				<div className={styles.btns}>
					{showNameInput ? (
						<div>
							<Button
								disabled={isDisabled}
								type="button"
								onClick={ev => {
									ev.preventDefault();
									next();
								}}
							>
								{t("auth.next")}
							</Button>
						</div>
					) : (
						<Button
							type="submit"
							disabled={isDisabled}
							loading={isSubmitLoading}
						>
							{t("auth.submit")}
							<Tail />
						</Button>
					)}
					<Button
						pattern="ghost"
						onClick={ev => {
							ev.preventDefault();
							navigate(`/auth/sign-in${location.search}`);
						}}
						className={styles.login}
						type="button"
					>
						{t("auth.signIn")}
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
