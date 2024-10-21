import type { App } from "App";
import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { isMicroboardIframe } from "lib/isMicroboardIframe";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input";
import { Tail } from "View/AuthView/Tail";
import { Icon } from "View/Icon";
import { LockIcon } from "View/SignupView/LockIcon";
import { UiButton } from "View/Ui/UiButton";
import { UiLink } from "View/Ui/UiLink";
import { UiPanel } from "View/Ui/UiPanel";
import { PasswordChanged } from "View/Widgets/form-notifications/password-changed";
import { ChangePassword } from "./icons/ChangePassword";
import { Logout } from "./icons/Logout";
import styles from "./UserPanel.module.css";
import { useAppContext } from "View/AppContext";

interface UserDropDownProps extends React.HTMLAttributes<HTMLDivElement> {
	email?: string;
	isOpen: boolean;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	buttons: React.ReactNode[];
	openerRef?: RefObject<HTMLDivElement>;
	customTop?: number;
}

// TODO each file for each component
export const UserDropDown: React.FC<UserDropDownProps> = ({
	setIsDropdownOpen,
	isOpen,
	buttons,
	email,
	openerRef,
	customTop,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	const closeDropdown = (): void => {
		setIsDropdownOpen(false);
	};

	useOutsideClickHandler(dropdownRef, closeDropdown);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className={styles.dropdownWrapper}
			ref={dropdownRef}
			style={{ top: customTop }}
		>
			{email && (
				<div className={styles.userInfo}>
					<p className={styles.userEmail}>{email}</p>
				</div>
			)}
			<div className={styles.dropdownBtns}>
				{buttons.filter(React.isValidElement).map((button, index) => {
					return React.cloneElement(
						button as React.ReactElement<HTMLButtonElement>,
						{
							className: styles.dropdownBtn,
							key: index,
						},
					);
				})}
			</div>
		</div>
	);
};

interface UserPicProps extends React.HTMLAttributes<HTMLDivElement> {
	avatar?: string;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type TUserPicProps = UserPicProps &
	Omit<
		UserDropDownProps,
		"isOpen" | "setIsDropdownOpen" | "buttons" | "openerRef" | "customTop"
	>;

// TODO each file for each component
const UserPic: React.FC<TUserPicProps> = ({ ...props }) => {
	const { app } = useAppContext();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const userPanelRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const account = useAccount();

	return (
		<>
			<div
				className={styles.userPicWrapper}
				{...props}
				ref={userPanelRef}
				onMouseDown={event => {
					event.stopPropagation();
					if (!isDropdownOpen) {
						setIsDropdownOpen(true);
					} else {
						setIsDropdownOpen(false);
					}
				}}
			>
				<div className={styles.userPic}>
					<Icon iconName="UserPic" width={12} height={15} />
				</div>
			</div>
			<UserDropDown
				openerRef={userPanelRef}
				isOpen={isDropdownOpen}
				setIsDropdownOpen={setIsDropdownOpen}
				email={props.email}
				buttons={[
					<Button
						type="button"
						key="userDropDown1"
						onClick={() => {
							props.setIsModalOpen(true);
							setIsDropdownOpen(false);
						}}
						pattern="ghost"
					>
						<ChangePassword /> Change password
					</Button>,
					<Button
						type="button"
						key="userDropDown2"
						pattern="ghost"
						onClick={async () => {
							await account.logout();
							navigate(0);
						}}
					>
						<Logout /> Log out
					</Button>,
				]}
			/>
		</>
	);
};

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO each file for each component
const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [error, setError] = useState("");
	const { t } = useTranslation();
	const [isPasswordChanged, setIsPasswordChanged] = useState(false);
	const account = useAccount();
	// const navigate = useNavigate();

	// const [currentPassword, setCurrentPassword] = useState("");
	// const [newPassword, setNewPassword] = useState("");
	// const [confirmPassword, setConfirmPassword] = useState("");

	const closeModal = (): void => {
		setIsOpen(false);
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

	useOutsideClickHandler(modalRef, closeModal);

	useEffect(() => {
		setError("");
		setIsPasswordChanged(false);
	}, [isOpen]);

	if (!isOpen) {
		return null;
	}

	if (isPasswordChanged) {
		return (
			<div className={styles.modalWrapper}>
				<div ref={modalRef} className={styles.modal}>
					<PasswordChanged />
					<div className={styles.passwordChangedGap}></div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.modalWrapper}>
			<div ref={modalRef} className={styles.modal}>
				<h2 className={styles.modalTitle}>Change password</h2>
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
							placeholder="Current password"
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
							placeholder="New password"
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
							placeholder="Repeat new password"
							helperText="The password must be at least 8 characters long"
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
							{t("auth.submit")} <Tail />
						</Button>
						<Button pattern="ghost" onClick={closeModal}>
							{t("auth.cancel")}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export const UserPanel: React.FC<{ app: App }> = ({ app }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { t } = useTranslation();
	const navigate = useNavigate();
	const account = useAccount();

	const insideOfMicroboard =
		document.referrer.includes("https://microboard.io/") ||
		document.referrer.includes("https://microboard.ru/");

	if (!account.isLoggedIn) {
		return (
			<UiPanel
				padding={0}
				className={clsx(
					styles.wrapper,
					isMicroboardIframe() && insideOfMicroboard && styles.iframe,
				)}
			>
				<div className={styles.unauthWrapper}>
					{/* <span className={styles.unauthText}> */}
					{/* 	Save&nbsp;this&nbsp;board&nbsp;to&nbsp;favorite. */}
					{/* </span> */}

					<div className={styles.unauthBtns}>
						{/* <LanguagesDropdown */}
						{/* 	items={[ */}
						{/* 		<div key={1}> */}
						{/* 			<p */}
						{/* 				className={ */}
						{/* 					styles.unauthDescriptionTitle */}
						{/* 				} */}
						{/* 			> */}
						{/* 				You are the viewer on this board.{" "} */}
						{/* 			</p>{" "} */}
						{/* 			<p className={styles.unauthDescription}> */}
						{/* 				To ask for editor rights to make */}
						{/* 				changes, please{" "} */}
						{/* 				<Link */}
						{/* 					className={styles.unauthLink} */}
						{/* 					to="/auth/login" */}
						{/* 				> */}
						{/* 					log in */}
						{/* 				</Link>{" "} */}
						{/* 				or{" "} */}
						{/* 				<Link */}
						{/* 					className={styles.unauthLink} */}
						{/* 					to="/auth/sign-up" */}
						{/* 				> */}
						{/* 					sign up */}
						{/* 				</Link> */}
						{/* 				. */}
						{/* 			</p> */}
						{/* 		</div>, */}
						{/* 	]} */}
						{/* 	label={ */}
						{/* 		<> */}
						{/* 			<EyeOpen isCurrentColor /> View&nbsp;only */}
						{/* 		</> */}
						{/* 	} */}
						{/* /> */}
						{isMicroboardIframe() && insideOfMicroboard ? (
							<>
								<UiLink
									variant="secondary"
									className={styles.logInBtn}
									href={`/auth/sign-in`}
									target="_parent"
									size="sm"
								>
									{t("auth.login")}
								</UiLink>
								<UiLink
									className={clsx(
										styles.signUpBtn,
										styles.smallMobileHide,
									)}
									href={`/auth/sign-up`}
									size="sm"
									target="_parent"
								>
									{t("auth.signUpForFree")}
								</UiLink>
							</>
						) : (
							<>
								<UiButton
									variant="secondary"
									className={styles.logInBtn}
									onClick={() => navigate("/auth/sign-in")}
									size="sm"
								>
									{t("auth.login")}
								</UiButton>
								<UiButton
									className={styles.signUpBtn}
									onClick={() => navigate("/auth/sign-up")}
									size="sm"
								>
									{t("auth.signUpForFree")}
								</UiButton>
							</>
						)}
					</div>
				</div>
			</UiPanel>
		);
	}

	return (
		<>
			<UiPanel padding={0} className={styles.wrapper}>
				{/* <div className={styles.icons}>
					<button className={styles.icon}>
						<Click />
					</button>
					<button className={styles.icon}>
						<Thumb />
					</button>
					<button className={styles.icon}>
						<Ring />
					</button>
				</div>
				<Button className={styles.btn} pattern="primary">
					<UserShare />
					Share
				</Button> */}

				{/* TODO: remove temporarily inline style */}
				<div style={{ padding: "8px 6px" }}>
					<UserPic
						email={account.info?.email ?? ""}
						setIsModalOpen={setIsModalOpen}
						app={app}
					/>
				</div>
			</UiPanel>

			<Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
		</>
	);
};
