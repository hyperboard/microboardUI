import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "shared/ui-lib/Button";
import styles from "./UserPanel.module.css";
import { ChangePassword } from "./icons/ChangePassword";
import { Logout } from "./icons/Logout";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { Input } from "shared/ui-lib/Input";
import { Tail } from "View/AuthView/Tail";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { LockIcon } from "View/SignupView/LockIcon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PasswordChanged } from "View/Widgets/form-notifications/password-changed";
import { UiPanel } from "View/Ui/UiPanel";
import { UiButton } from "View/Ui/UiButton";
import { isIframe } from "lib/isIframe";
import { UiLink } from "View/Ui/UiLink";
import { App } from "App";

interface UserDropDownProps extends React.HTMLAttributes<HTMLDivElement> {
	email: string;
	isOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	app: App;
}

const UserDropDown: React.FC<UserDropDownProps> = ({
	email,
	setIsModalOpen,
	setIsAuth,
	setIsDropdownOpen,
	isOpen,
	app,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const nav = useNavigate();

	const closeDropdown = (): void => {
		setIsDropdownOpen(false);
	};

	useOutsideClickHandler(dropdownRef, closeDropdown);
	const logout = (): void => {
		fetch(`${getApiUrl()}/auth/logout`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		});
		setIsAuth(false);
		Cookies.remove("refreshToken");
		Cookies.remove("accessToken");
		app.storage.clean();
		nav(0);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className={styles.dropdownWrapper} ref={dropdownRef}>
			<div className={styles.userInfo}>
				{/* <p className={styles.userName}>John Doe</p> */}
				<p className={styles.userEmail}>{email}</p>
			</div>
			<div className={styles.dropdownBtns}>
				<Button
					onClick={() => {
						setIsModalOpen(true);
						setIsDropdownOpen(false);
					}}
					className={styles.dropdownBtn}
					pattern="ghost"
				>
					<ChangePassword /> Change password
				</Button>
				{/* <Button className={styles.dropdownBtn} pattern="ghost">
					<Upgrade /> Upgrade
				</Button> */}
				<Button
					className={styles.dropdownBtn}
					pattern="ghost"
					onClick={logout}
				>
					<Logout /> Log out
				</Button>
			</div>
		</div>
	);
};

interface UserPicProps extends React.HTMLAttributes<HTMLDivElement> {
	avatar?: string;
}

type TUserPicProps = UserPicProps &
	Omit<UserDropDownProps, "isOpen" | "setIsDropdownOpen">;

const UserPic: React.FC<TUserPicProps> = ({ ...props }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	return (
		<>
			<div
				className={styles.userPicWrapper}
				{...props}
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
					<svg
						width="12"
						height="15"
						viewBox="0 0 12 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M11.3327 14.666H9.99935V13.3327C9.99935 12.8022 9.78863 12.2935 9.41356 11.9185C9.03849 11.5434 8.52978 11.3327 7.99935 11.3327H3.99935C3.46892 11.3327 2.96021 11.5434 2.58514 11.9185C2.21006 12.2935 1.99935 12.8022 1.99935 13.3327V14.666H0.666016V13.3327C0.666016 12.4486 1.01721 11.6008 1.64233 10.9757C2.26745 10.3505 3.11529 9.99935 3.99935 9.99935H7.99935C8.8834 9.99935 9.73125 10.3505 10.3564 10.9757C10.9815 11.6008 11.3327 12.4486 11.3327 13.3327V14.666ZM5.99935 8.66602C5.47406 8.66602 4.95392 8.56255 4.46861 8.36153C3.98331 8.16051 3.54236 7.86588 3.17092 7.49444C2.79949 7.12301 2.50485 6.68205 2.30383 6.19675C2.10281 5.71145 1.99935 5.1913 1.99935 4.66602C1.99935 4.14073 2.10281 3.62058 2.30383 3.13528C2.50485 2.64998 2.79949 2.20902 3.17092 1.83759C3.54236 1.46615 3.98331 1.17152 4.46861 0.970497C4.95392 0.769479 5.47406 0.666016 5.99935 0.666016C7.06021 0.666016 8.07763 1.08744 8.82778 1.83759C9.57792 2.58773 9.99935 3.60515 9.99935 4.66602C9.99935 5.72688 9.57792 6.7443 8.82778 7.49444C8.07763 8.24459 7.06021 8.66602 5.99935 8.66602V8.66602ZM5.99935 7.33268C6.70659 7.33268 7.38487 7.05173 7.88497 6.55163C8.38506 6.05154 8.66602 5.37326 8.66602 4.66602C8.66602 3.95877 8.38506 3.28049 7.88497 2.7804C7.38487 2.2803 6.70659 1.99935 5.99935 1.99935C5.2921 1.99935 4.61383 2.2803 4.11373 2.7804C3.61363 3.28049 3.33268 3.95877 3.33268 4.66602C3.33268 5.37326 3.61363 6.05154 4.11373 6.55163C4.61383 7.05173 5.2921 7.33268 5.99935 7.33268V7.33268Z"
							fill="#696B76"
						/>
					</svg>
				</div>
			</div>
			<UserDropDown
				isOpen={isDropdownOpen}
				setIsDropdownOpen={setIsDropdownOpen}
				email={props.email}
				setIsModalOpen={props.setIsModalOpen}
				setIsAuth={props.setIsAuth}
				app={props.app}
			/>
		</>
	);
};

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen }) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
	const [isSubmitLoading, setIsSubmitLoading] = useState(false);
	const [error, setError] = useState("");
	const { t } = useTranslation();
	const [isPasswordChanged, setIsPasswordChanged] = useState(false);
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
		fetch(`${getApiUrl()}/auth/password/change`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
			body: JSON.stringify({
				oldPassword: formRef.current.currentPassword.value,
				newPassword: formRef.current.newPassword.value,
			}),
		})
			.then(async response => {
				if (response.ok) {
					// setIsOpen(false);
					setIsPasswordChanged(true);
					return response.json();
				} else {
					const data = await response.json();
					return Promise.reject(data);
				}
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
	const [email, setEmail] = useState("example@mail.com");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAuth, setIsAuth] = useState(false);
	const { t } = useTranslation();
	const navigate = useNavigate();

	useEffect(() => {
		app.storage.setIsAuth(isAuth);
		if (isAuth) {
			app.storage.visitBoard({ boardId: app.getBoard().getBoardId() });
		}
	}, [isAuth]);

	const isMicroboardIframe =
		isIframe() && import.meta.env.INTEGRATION_UI === "microboard";

	useLayoutEffect(() => {
		fetch(`${getApiUrl()}/users/me`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		})
			.then(response => {
				if (!response.ok) {
					return Promise.reject(response);
				}
				return response.json();
			})
			.then(data => {
				setEmail(data.email);
				setIsAuth(true);
			})
			.catch(() => {
				setIsAuth(false);
			});
	});

	if (!isAuth) {
		return (
			<UiPanel padding={0} className={styles.wrapper}>
				<div className={styles.unauthWrapper}>
					{/* <span className={styles.unauthText}> */}
					{/* 	Save&nbsp;this&nbsp;board&nbsp;to&nbsp;favorite. */}
					{/* </span> */}

					<div className={styles.unauthBtns}>
						{/* <Dropdown */}
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
						{isMicroboardIframe ? (
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
									className={styles.signUpBtn}
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
						email={email}
						setIsModalOpen={setIsModalOpen}
						setIsAuth={setIsAuth}
						app={app}
					/>
				</div>
			</UiPanel>

			<Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
		</>
	);
};
