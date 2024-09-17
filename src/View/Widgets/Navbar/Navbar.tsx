import React from "react";
import { LeadIcon } from "./lead-icon";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import { isIframe } from "lib/isIframe";

const loginVisibleRoutes = ["/auth/verify", "/auth/sign-up"];
const signUpVisibleRoutes = [
	"/auth/sign-in",
	"/auth/forgot-password",
	"/auth/restore-password",
];

export const Navbar: React.FC = () => {
	const { t } = useTranslation();
	const location = useLocation();

	const isLoginVisible = loginVisibleRoutes.includes(location.pathname);
	const isSignUpVisible = signUpVisibleRoutes.includes(location.pathname);

	return (
		<header className="NavbarWrapper">
			<a
				className="Logo"
				target={isIframe() ? "_blank" : "_top"}
				href="https://microboard.ru"
				rel="noreferrer"
			>
				<LeadIcon width={20} height={20} />
				<span>Microboard</span>
			</a>
			<div>
				{isLoginVisible && (
					<NavLink to="/auth/sign-in" className={"Link"}>
						{t("auth.signIn")}
					</NavLink>
				)}
				{isSignUpVisible && (
					<NavLink to="/auth/sign-up" className={"Link"}>
						{t("auth.signUpForFree")}
					</NavLink>
				)}
			</div>
		</header>
	);
};
