import * as React from "react";
import { EmailLogin } from "./EmailLogin";
import { Menu } from "./Menu";

export class Login extends React.PureComponent<
	{},
	{
		isOpen: boolean;
	}
> {
	state = {
		isOpen: false,
	};

	toggleMenu = (): void => {
		this.setState(prevState => ({
			isOpen: !prevState.isOpen,
			isEmailOpen: false, // Collapse email branch when login branch is toggled
		}));
	};

	render(): React.ReactElement | null {
		return null;
		const { isOpen } = this.state;
		return (
			<Menu
				isOpen={isOpen}
				offset={0}
				onToggle={this.toggleMenu}
				heading={"Login"}
			>
				<EmailLogin />
			</Menu>
		);
	}
}
