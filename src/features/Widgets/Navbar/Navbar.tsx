import React from "react";
import { LeadIcon } from "./lead-icon";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import { isIframe } from "shared/lib/isIframe";
import { LAST_BOARD_KEY_QS } from "App/App";
import { Icon } from "shared/ui-lib/Icon";

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
	const lastBoardLink = localStorage.getItem(LAST_BOARD_KEY_QS);
	const backToSelect =
		new URLSearchParams(location.search).get("backToSelect") === "true";

	return (
		<>
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
						<NavLink
							to={`/auth/sign-in${location.search}`}
							className={"Link"}
						>
							{t("auth.signIn")}
						</NavLink>
					)}
					{isSignUpVisible && (
						<NavLink
							to={`/auth/sign-up${location.search}`}
							className={"Link"}
						>
							{t("auth.signUpForFree")}
						</NavLink>
					)}
				</div>
			</header>
			{(lastBoardLink || backToSelect) && (
				<NavLink
					to={
						!backToSelect
							? `/boards/${lastBoardLink}`
							: "/selectBoard"
					}
					className={"Link Back"}
				>
					<Icon width={20} height={20} iconName="ArrowLeft1" />{" "}
					{!backToSelect
						? t("auth.backToBoard")
						: t("auth.backToBoardSelection")}
				</NavLink>
			)}
		</>
	);
};
