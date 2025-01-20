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
import { Icon } from "View/Icon";

export const CHANGE_PASSWORD_MODAL = Symbol("ChangePasswordModal");

export function ChangePasswordModal(): JSX.Element {
	const formRef = useRef<HTMLFormElement>(null);
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [currentPasswordError, setCurrentPasswordError] = useState("");
	const [newPasswordError, setNewPasswordError] = useState("");
	const [confirmPasswordError, setConfirmPasswordError] = useState("");
	const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
	const [newPasswordTouched, setNewPasswordTouched] = useState(false);
	const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
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
		setConfirmPasswordError("");
		setCurrentPasswordError("");
		setNewPasswordError("");
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
			})
			.catch(error => {
				if (error?.message === "Wrong password") {
					setCurrentPasswordError(
						t("auth.currentPasswordIsIncorrect"),
					);
					return;
				}
				if (error?.message === "ERROR_SAME_PASSWORD") {
					setNewPasswordError(t("auth.passwordMustBeDifferent"));
					return;
				}
				// different error?
				setConfirmPasswordError(t("auth.passwordDoNotMatch"));
			})
			.finally(() => {
				setIsSubmitDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	const checkForm = () => {
		const form = formRef.current;
		if (!form) {
			return;
		}
		const currentPassword = form.currentPassword.value;
		const newPassword = form.newPassword.value;
		const confirmPassword = form.confirmPassword.value;

		setConfirmPasswordError("");
		setCurrentPasswordError("");
		setNewPasswordError("");
		setIsSubmitDisabled(false);

		if (currentPassword === "") {
			setCurrentPasswordError("");
			setIsSubmitDisabled(true);
		}

		if (newPassword === "") {
			setNewPasswordError("");
			setIsSubmitDisabled(true);
		}

		if (confirmPassword === "") {
			setConfirmPasswordError("");
			setIsSubmitDisabled(true);
		}

		const MIN_PASSWORD_LENGTH = 8;
		if (currentPasswordTouched) {
			if (currentPassword.length < MIN_PASSWORD_LENGTH) {
				setCurrentPasswordError(t("profile.passwordConstraint"));
				setIsSubmitDisabled(true);
			}
		}
		if (newPasswordTouched) {
			if (newPassword.length < MIN_PASSWORD_LENGTH) {
				setNewPasswordError(t("profile.passwordConstraint"));
				setIsSubmitDisabled(true);
			}
			if (newPassword === currentPassword) {
				setNewPasswordError(t("auth.passwordMustBeDifferent"));
				setIsSubmitDisabled(true);
			}
		}

		if (confirmPasswordTouched) {
			if (newPassword !== confirmPassword) {
				setConfirmPasswordError(t("auth.passwordDoNotMatch"));
				setIsSubmitDisabled(true);
			}
		}
	};

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
				<Button
					onClick={closeModal}
					className={styles.backBtn}
					pattern="ghost"
				>
					<Icon width={20} height={20} iconName="BackArrow" />{" "}
					{t("profile.title")}
				</Button>
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
							onFocus={() => {
								setCurrentPasswordTouched(true);
							}}
							hasError={!!currentPasswordError}
							placeholder={t("profile.currentPassword")}
							onInput={checkForm}
							onBlur={checkForm}
						/>
						<Input
							prefixIcon={<LockIcon />}
							id="newPassword"
							password
							onFocus={() => {
								setNewPasswordTouched(true);
							}}
							hasError={!!newPasswordError}
							placeholder={t("profile.newPassword")}
							onInput={checkForm}
							onBlur={checkForm}
						/>
						<Input
							prefixIcon={<LockIcon />}
							id="confirmPassword"
							password
							onFocus={() => {
								setConfirmPasswordTouched(true);
							}}
							placeholder={t("profile.repeatPassword")}
							onInput={checkForm}
							onBlur={checkForm}
							hasError={!!confirmPasswordError}
							helperText={
								!currentPasswordError &&
								!newPasswordError &&
								!confirmPasswordError
									? t("profile.passwordConstraint")
									: ""
							}
							errorText={
								currentPasswordError ||
								newPasswordError ||
								confirmPasswordError
							}
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
