/* eslint-disable max-classes-per-file */
import * as React from "react";
import { Menu, SidePanelMenuOffset } from "./SidePanel";
import { getApiUrl } from "Config";
import { App } from "App";
import { Menu } from "./Menu";
import { useTranslation } from "react-i18next";

// TODO email password login
class EmailLoginState {
	isMenuOpen = false;
	isPasscodeSent = false;
	isPasscodeError = false;
	isLoginError = false;
	email = "";
	passcode = "";
}

type EmailLoginProps = { app: App };

export function EmailLogin({ app }: EmailLoginProps) {
	const { t } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const [isPasscodeSent, setIsPasscodeSent] = React.useState(false);
	const [isPasscodeError, setIsPasscodeError] = React.useState(false);
	const [isLoginError, setIsLoginError] = React.useState(false);
	const [email, setEmail] = React.useState("");
	const [passcode, setPasscode] = React.useState("");

	const toggleMenu = (): void => {
		setIsMenuOpen(prev => !prev);
	};

	const handleEmailInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		setEmail(event.target.value);
	};

	const handlePasscodeInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		setPasscode(event.target.value);
	};

	const requestPasscode = (): void => {
		setIsPasscodeSent(true);

		fetch(getApiUrl("/passcode"), {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify({
				email: email,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("response not OK");
				}
				response.json();
			})
			.then(data => {
				setIsPasscodeSent(true);
			})
			.catch(error => {
				setIsPasscodeError(true);
			});
	};

	const loginWithPasscode = (): void => {
		fetch(getApiUrl("/login/passcode"), {
			method: "POST",
			mode: "cors",
			cache: "no-cache",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			redirect: "follow",
			referrerPolicy: "no-referrer",
			body: JSON.stringify({
				email,
				passcode,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("response not OK");
				}
				response.json();
			})
			.then(data => {
				app.logins;
			})
			.catch(error => {
				setIsLoginError(true);
			});
	};

	const offset = SidePanelMenuOffset;

	return (
		<Menu
			isOpen={isMenuOpen}
			offset={offset}
			onToggle={toggleMenu}
			heading={"withEmail"}
		>
			<EmailInput
				email={email}
				offset={offset * 2}
				handleEmailInputChange={handleEmailInputChange}
			/>
			{!isPasscodeSent && (
				<InputButton
					offset={offset * 2}
					id="continueToSendEmailLoginPasscode"
					value="Continue"
					onClick={requestPasscode}
				/>
			)}
			{isPasscodeSent && (
				<li>
					<div
						className="SidePanelToggleContent"
						style={{
							marginLeft: offset * 2,
						}}
					>
						{t("auth.checkEmail")}
					</div>
				</li>
			)}
			{isPasscodeSent && (
				<PasscodeInput
					password={passcode}
					offset={offset * 2}
					handlePasswordInputChange={handlePasscodeInputChange}
				/>
			)}
			{isPasscodeSent && (
				<InputButton
					offset={offset * 2}
					id="continueToLoginWithEmail"
					value="Continue"
					onClick={loginWithPasscode}
				/>
			)}
		</Menu>
	);
}

type EmailInputProps = {
	email: string;
	offset: number;
	handleEmailInputChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void;
};

function EmailInput({
	email,
	handleEmailInputChange,
	offset,
}: EmailInputProps) {
	const { t } = useTranslation();
	return (
		<li className={"SidePanelListElement"}>
			<div className="button">
				<div
					className="SidePanelToggleContent"
					style={{
						marginLeft: offset,
					}}
				>
					<label htmlFor="emailInput">{t("auth.email")}:</label>
					<input
						className="SidePanelInput"
						type="text"
						id="emailInput"
						placeholder={t("auth.emailPlaceholder")}
						value={email}
						onChange={handleEmailInputChange}
					/>
				</div>
			</div>
		</li>
	);
}

type PasscodeInput = {
	password: string;
	offset: number;
	handlePasswordInputChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void;
};

export function PasscodeInput({
	handlePasswordInputChange,
	offset,
	password,
}: PasscodeInput) {
	const { t } = useTranslation();
	return (
		<li className={"SidePanelListElement"}>
			<div className="button">
				<div
					className="SidePanelToggleContent"
					style={{
						marginLeft: offset,
					}}
				>
					<label htmlFor="passwordInput">{t("auth.passcode")}:</label>
					<input
						className="SidePanelInput"
						type="password"
						id="passwordInput"
						placeholder={t("auth.passcodePlaceholder")}
						value={password}
						onChange={handlePasswordInputChange}
					/>
				</div>
			</div>
		</li>
	);
}

type InputButtonProps = {
	offset: number;
	onClick: () => void;
	id: string;
	value: string;
};

function InputButton({ id, offset, onClick, value }: InputButtonProps) {
	return (
		<li className={"SidePanelListElement"}>
			<div className="button">
				<div
					className="SidePanelToggleContent"
					style={{
						marginLeft: offset,
					}}
				>
					<input
						className="SidePanelInput"
						type="submit"
						id={id}
						value={value}
						onClick={onClick}
					/>
				</div>
			</div>
		</li>
	);
}
