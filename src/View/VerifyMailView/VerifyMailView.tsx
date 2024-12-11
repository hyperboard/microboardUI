import { App } from "App";
import { useAccount } from "App/useAccount";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input/Input";
import { Tail } from "View/AuthView/Tail";
import { LAST_BOARD_KEY_QS } from "App/App";
import styles from "./VerifyMailView.module.css";
import { LockIcon } from "View/SignupView/LockIcon";
import { useBoardsList } from "App/useBoardsList";

const secondsToHumanReadable = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const VerifyMailView: React.FC<{ app: App }> = ({ app }) => {
	const { t } = useTranslation();
	const [searchParams, _setSearchParams] = useSearchParams();
	const [retryCount, setRetryCount] = React.useState(0);
	const navigate = useNavigate();
	// const [passcode, setPasscode] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [retryDisabled, setRetryDisabled] = useState<boolean>(false);
	const [isRetryLoading, setIsRetryLoading] = useState<boolean>(false);
	const formRef = useRef<HTMLFormElement>(null);
	const [codeTip, setCodeTip] = useState<
		"auth.enterCodeBelow" | "auth.enterNewCodeBelow" | ""
	>("");
	const [isNewCode, setIsNewCode] = useState<boolean>(false);
	const [isAttemptsExceeded, setIsAttemptsExceeded] =
		useState<boolean>(false);
	const account = useAccount();
	const boardsList = useBoardsList();

	const onSuccess = async (): Promise<void> => {
		console.log("success");
		await account.fetchAccountInfo();
		await account.onLogin?.();
		if (searchParams.get("backToSelect") === "true") {
			navigate("/selectBoard");
		} else if (localStorage.getItem(LAST_BOARD_KEY_QS)) {
			navigate(`/boards/${localStorage.getItem(LAST_BOARD_KEY_QS)}`);
		} else {
			const boardId = await boardsList.createBoard();
			if (boardId) {
				navigate(`/boards/${boardId}`);
			}
		}
	};

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		if (!searchParams.get("email")) {
			return;
		}
		if (searchParams.get("email")) {
			const passcode = formRef.current?.code.value;
			setSubmitDisabled(true);
			setIsSubmitLoading(true);

			account
				.verifyMail(searchParams.get("email") ?? "", passcode)
				.then(onSuccess)
				.catch(error => {
					console.log("error", error);
					if (error?.message === "PASSCODE_ATTEMPTS_EXCEEDED") {
						setIsAttemptsExceeded(true);
						setError(t("auth.errorVerificationCodeAttempts"));
						setSubmitDisabled(true);
						return;
					}
					setError(t("auth.errorVerificationCode"));
				})
				.finally(() => {
					setIsSubmitLoading(false);
					setSubmitDisabled(false);
				});
		}
	};

	const checkForm = (checkAttempts = true): void => {
		if (checkAttempts && isAttemptsExceeded) {
			setError(t("auth.errorVerificationCodeAttempts"));
			return;
		}

		if (!formRef.current) {
			return;
		}
		const passcode: string = formRef.current.code.value;

		if (!passcode) {
			setSubmitDisabled(true);
			return;
		}

		if (passcode.length !== 6 || isNaN(parseInt(passcode))) {
			setSubmitDisabled(true);
			return;
		}

		setSubmitDisabled(false);
	};

	const onResend = async (): Promise<void> => {
		if (!searchParams.get("email")) {
			return;
		}
		setRetryDisabled(true);
		setIsRetryLoading(true);

		account
			.resendMail(searchParams.get("email") ?? "")
			.then(() => {
				setRetryCount(60 * 3);
				setIsAttemptsExceeded(false);
				setError("");
				setCodeTip("auth.enterNewCodeBelow");
				checkForm(false);
				const form = formRef.current;
				if (form) {
					form.code.value = "";
				}
				setIsNewCode(true);
			})
			.catch(error => {
				if (error?.message?.startsWith("Can retry after")) {
					try {
						const timeToResend =
							error?.message.split(":")[1] / 1000;
						setRetryCount(parseInt(timeToResend.toFixed(0)));
					} catch (err) {
						console.log("no timer");
					}

					return;
				}
				if (
					error?.message === "Passcode not found" ||
					error?.message === "User not found"
				) {
					navigate(`/auth/sign-up${location.search}`);
					return;
				}
			})
			.finally(() => {
				setRetryDisabled(false);
				setIsRetryLoading(false);
			});
	};

	const dbCheckForm = checkForm;

	useEffect(() => {
		if (!searchParams.get("email")) {
			return;
		}
		setRetryDisabled(true);
		setIsRetryLoading(true);
		account
			.checkVerificationCodes(searchParams.get("email") ?? "")
			.then(data => {
				if (data?.message === "PASSCODE_SENDED") {
					setRetryCount(60 * 3);
				}
				if (data?.message.startsWith("PASSCODE_NOT_SENDED")) {
					console.log("here");

					try {
						const dateString = data?.message.split(": ")[1];
						const resendDate = new Date(dateString);
						const currentTime = new Date();
						const timeToResend =
							Math.abs(
								resendDate.getTime() +
									60 * 3000 -
									currentTime.getTime(),
							) / 1000;
						console.log(timeToResend, data?.message);
						setRetryCount(Math.max(0, Math.round(timeToResend)));
					} catch (_) {
						setRetryCount(60 * 3);
					}
				}
			})
			.finally(() => {
				setRetryDisabled(false);
				setIsRetryLoading(false);
			});

		if (!searchParams.get("passcode")) {
			return;
		}
		setIsSubmitLoading(true);
		account
			.verifyMail(
				searchParams.get("email") || "",
				searchParams.get("passcode") || "",
			)
			.then(onSuccess)
			.catch(_ => {
				setError(t("auth.errorVerificationCode"));
			})
			.finally(() => {
				setIsSubmitLoading(false);
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
			<form onSubmit={onSubmit} className={styles.form} ref={formRef}>
				<h1 className={styles.title}>{t("auth.checkInbox")}</h1>

				{!isNewCode && (
					<p className={styles.checkEmail}>
						{t("auth.weSentCode")}{" "}
						<span className={styles.email}>
							{searchParams.get("email")}
						</span>
						<br />
						{t("auth.enterCodeBelow")}
					</p>
				)}

				<Input
					prefixIcon={<LockIcon />}
					type="text"
					id="code"
					name="code"
					maxLength={6}
					placeholder="Verification code"
					label={codeTip ? t(codeTip) : ""}
					hasError={!!error.length}
					errorText={error}
					onInput={() => dbCheckForm()}
				/>
				<div className={styles.btns}>
					<Button
						disabled={isAttemptsExceeded || submitDisabled}
						type="submit"
						loading={isSubmitLoading}
					>
						{t("auth.submit")}
						<Tail />
					</Button>
					<Button
						pattern="ghost"
						disabled={retryDisabled || retryCount > 0}
						loading={isRetryLoading}
						type="button"
						onClick={onResend}
					>
						{t("auth.resendCode")}{" "}
						{retryCount > 0
							? `(${secondsToHumanReadable(retryCount)})`
							: null}
					</Button>
				</div>
			</form>
		</div>
	);
};
