/* eslint-disable max-classes-per-file */
import * as React from "react";
import { Menu, SidePanelMenuOffset } from "./SidePanel";
import { getApiUrl } from "Config";
import { App } from "App";
import { Menu } from "./Menu";

// TODO email password login
class EmailLoginState {
	isMenuOpen = false;
	isPasscodeSent = false;
	isPasscodeError = false;
	isLoginError = false;
	email = "";
	passcode = "";
}

export class EmailLogin extends React.PureComponent<
	{ app: App },
	EmailLoginState
> {
	state = new EmailLoginState();

	toggleMenu = (): void => {
		this.setState(prevState => ({
			isMenuOpen: !prevState.isMenuOpen,
		}));
	};

	handleEmailInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		this.setState({
			email: event.target.value,
		});
	};

	handlePasscodeInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	): void => {
		this.setState({
			passcode: event.target.value,
		});
	};

	requestPasscode = (): void => {
		this.setState({
			isPasscodeSent: true,
		});

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
				email: this.state.email,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("response not OK");
				}
				response.json();
			})
			.then(data => {
				this.setState({
					isPasscodeSent: true,
				});
			})
			.catch(error => {
				this.setState({
					isPasscodeError: true,
				});
			});
	};

	loginWithPasscode = (): void => {
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
				email: this.state.email,
				passcode: this.state.passcode,
			}),
		})
			.then(response => {
				if (!response.ok) {
					throw new Error("response not OK");
				}
				response.json();
			})
			.then(data => {
				this.props.app.logins;
			})
			.catch(error => {
				this.setState({
					isLoginError: true,
				});
			});
	};

	render(): React.ReactElement | null {
		const {
			isMenuOpen: isEmailOpen,
			isPasscodeSent,
			email,
			passcode: password,
		} = this.state;
		const offset = SidePanelMenuOffset;

		return (
			<Menu
				isOpen={isEmailOpen}
				offset={offset}
				onToggle={this.toggleMenu}
				heading={"withEmail"}
			>
				<EmailInput
					email={email}
					offset={offset * 2}
					handleEmailInputChange={this.handleEmailInputChange}
				/>
				{!isPasscodeSent && (
					<InputButton
						offset={offset * 2}
						id="continueToSendEmailLoginPasscode"
						value="Continue"
						onClick={this.requestPasscode}
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
							Check for an email with a pass code.
						</div>
					</li>
				)}
				{isPasscodeSent && (
					<PasscodeInput
						password={password}
						offset={offset * 2}
						handlePasswordInputChange={
							this.handlePasscodeInputChange
						}
					/>
				)}
				{isPasscodeSent && (
					<InputButton
						offset={offset * 2}
						id="continueToLoginWithEmail"
						value="Continue"
						onClick={this.loginWithPasscode}
					/>
				)}
		</Menu>
		);
	}
}

class EmailInput extends React.PureComponent<{
	email: string;
	offset: number;
	handleEmailInputChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void;
}> {
	render(): React.ReactElement | null {
		const { email, offset, handleEmailInputChange } = this.props;

		return (
			<li
					className={"SidePanelListElement"}
>
				<div className="button">
					<div
						className="SidePanelToggleContent"
						style={{
							marginLeft: offset,
						}}
					>
						<label htmlFor="emailInput">Email:</label>
						<input
							className="SidePanelInput"
							type="text"
							id="emailInput"
							placeholder="Enter Email"
							value={email}
							onChange={handleEmailInputChange}
						/>
					</div>
				</div>
			</li>
		);
	}
}

class PasscodeInput extends React.PureComponent<{
	password: string;
	offset: number;
	handlePasswordInputChange: (
		event: React.ChangeEvent<HTMLInputElement>,
	) => void;
}> {
	render(): React.ReactElement | null {
		const { password, offset, handlePasswordInputChange } = this.props;

		return (
			<li
					className={"SidePanelListElement"}
>
				<div className="button">
					<div
						className="SidePanelToggleContent"
						style={{
							marginLeft: offset,
						}}
					>
						<label htmlFor="passwordInput">Passcode:</label>
						<input
							className="SidePanelInput"
							type="password"
							id="passwordInput"
							placeholder="Enter Passcode"
							value={password}
							onChange={handlePasswordInputChange}
						/>
					</div>
				</div>
			</li>
		);
	}
}

class InputButton extends React.PureComponent<{
	offset: number;
	onClick: () => void;
	id: string;
	value: string;
}> {
	render(): React.ReactElement | null {
		const { offset, onClick, id, value } = this.props;

		return (
			<li
					className={"SidePanelListElement"}
>
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
}
