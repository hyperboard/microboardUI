import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiModal } from "View/Ui/UiModal/UiModal";
import { PasswordChanged } from "View/Widgets/form-notifications/password-changed";
import React, { useRef, useState, type MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ChangePassword.module.css";
import { Input } from "shared/ui-lib/Input";
import { LockIcon } from "View/SignupView/LockIcon";
import { Button } from "shared/ui-lib/Button";
import { Tail } from "View/AuthView/Tail";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";

export const CHANGE_PASSWORD_MODAL = Symbol("ChangePasswordModal");

export function ChangePasswordModal(): JSX.Element {
	const formRef = useRef<HTMLFormElement>(null);
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [error, setError] = useState("");
	const { t } = useTranslation();
	const [isPasswordChanged, setIsPasswordChanged] = useState(false);
	const account = useAccount();
	const { openModal } = useUiModalContext();

	const closeModal: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		openModal(PROFILE_SETTINGS_MODAL_ID);
		const form = formRef.current;
		if (!form) {
			return;
		}

		form.reset();
		setIsSubmitDisabled(true);
		setError("");
	};

	const onSubmit = (event: React.FormEvent): void => {
		event.preventDefault();
		const form = formRef.current;
		if (!form) {
			return;
		}

		setIsSubmitDisabled(true);
		setIsSubmitLoading(true);

		account
			.changePassword(
				formRef.current.currentPassword.value,
				formRef.current.newPassword.value,
			)
			.then(() => {
				setIsPasswordChanged(true);
				setTimeout(() => {
					close();
				}, 3000);
			})
			.catch(error => {
				if (error?.message === "Wrong password") {
					setError(t("auth.currentPasswordIsIncorrect"));
					return;
				}
				if (error?.message === "ERROR_SAME_PASSWORD") {
					setError(t("auth.passwordMustBeDifferent"));
					return;
				}
				// different error?
				setError(t("auth.passwordDoNotMatch"));
			})
			.finally(() => {
				setIsSubmitDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	const checkForm = (): void => {
		const form = formRef.current;
		if (!form) {
			return;
		}
		const currentPassword = form.currentPassword.value;
		const newPassword = form.newPassword.value;
		const confirmPassword = form.confirmPassword.value;

		if (
			currentPassword === "" ||
			newPassword === "" ||
			confirmPassword === ""
		) {
			setError("");
			setIsSubmitDisabled(true);
			return;
		}

		const MIN_PASSWORD_LENGTH = 8;
		if (
			newPassword.length < MIN_PASSWORD_LENGTH ||
			confirmPassword.length < MIN_PASSWORD_LENGTH
		) {
			setError("");
			setIsSubmitDisabled(true);
			return;
		}

		if (confirmPassword.length < newPassword.length) {
			setError("");
			setIsSubmitDisabled(true);
			return;
		}

		if (newPassword === currentPassword) {
			setError(t("auth.passwordMustBeDifferent"));
			setIsSubmitDisabled(true);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError(t("auth.passwordDoNotMatch"));
			setIsSubmitDisabled(true);
			return;
		}

		function checkLength(str: string): boolean {
			if (str.length < 8) {
				return false;
			}
			return true;
		}

		if (!checkLength(newPassword) || !checkLength(confirmPassword)) {
			setError("");
			return;
		}

		setError("");
		setIsSubmitDisabled(false);
	};

	const dbCheckForm = checkForm;

	if (isPasswordChanged) {
		return (
			<UiModal modalId={CHANGE_PASSWORD_MODAL}>
				<div className={styles.modalWrapper}>
					<div className={styles.modal}>
						<PasswordChanged />
						<div className={styles.passwordChangedGap}></div>
					</div>
				</div>
			</UiModal>
		);
	}

	return (
		<UiModal modalId={CHANGE_PASSWORD_MODAL}>
			<div className={styles.modal}>
				<h2 className={styles.modalTitle}>
					{t("profile.changePassword")}
				</h2>
				<form
					className={styles.modalForm}
					ref={formRef}
					onSubmit={onSubmit}
				>
					<div className={styles.modalInputs}>
						<Input
							prefixIcon={<LockIcon />}
							id="currentPassword"
							password
							placeholder={t("profile.currentPassword")}
							// hasError={!!error.length}
							// onInput={event => {
							// 	dbCheckForm(event);
							// }}
							onKeyDown={event => {
								event.stopPropagation();
								dbCheckForm();
							}}
							// onInput={event => {
							// 	setCurrentPassword(event.target.value);
							// }}
							onBlur={dbCheckForm}
						/>
						<Input
							prefixIcon={<LockIcon />}
							id="newPassword"
							password
							placeholder={t("profile.newPassword")}
							// hasError={!!error.length}
							// onInput={dbCheckForm}
							onKeyDown={event => {
								event.stopPropagation();
								dbCheckForm();
							}}
							// onInput={event => {
							// 	setNewPassword(event.target.value);
							// }}
							onBlur={dbCheckForm}
						/>
						<Input
							prefixIcon={<LockIcon />}
							id="confirmPassword"
							password
							placeholder={t("profile.repeatPassword")}
							helperText={t("profile.passwordConstraint")}
							hasError={!!error.length}
							onInput={dbCheckForm}
							errorText={error}
							onKeyDown={event => {
								event.stopPropagation();
								// dbCheckForm();
							}}
							// onInput={event => {
							// 	setConfirmPassword(event.target.value);
							// }}
							onBlur={dbCheckForm}
						/>
					</div>

					<div className={styles.modalBtns}>
						<Button
							type="submit"
							disabled={isSubmitDisabled}
							loading={isSubmitLoading}
						>
							{t("profile.savePassword")} <Tail />
						</Button>
						<Button pattern="ghost" onClick={closeModal}>
							{t("auth.cancel")}
						</Button>
					</div>
				</form>
			</div>
		</UiModal>
	);
}
