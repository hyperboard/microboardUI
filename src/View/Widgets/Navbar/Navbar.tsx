import React from "react";
import { LeadIcon } from "./lead-icon";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

export const Navbar: React.FC = () => {
	const { t } = useTranslation();

	return (
		<header className="NavbarWrapper">
			<div className="Logo">
				<LeadIcon width={20} height={20} />
				<span>Microboard</span>
			</div>
			<div>
				<NavLink
					to="/auth/sign-in"
					className={({ isActive }) =>
						isActive ? "LinkActive" : "LinkInactive"
					}
				>
					{t("auth.signIn")}
				</NavLink>
				<NavLink
					to="/auth/sign-up"
					className={({ isActive }) =>
						isActive ? "LinkActive" : "LinkInactive"
					}
				>
					{t("auth.signUp")}
				</NavLink>
			</div>
		</header>
	);
};
