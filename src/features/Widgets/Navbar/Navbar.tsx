import React from "react";
import { LeadIcon } from "./lead-icon";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import { isIframe } from "shared/lib/isIframe";
import { LAST_BOARD_KEY_QS } from "App/App";
import { Icon } from "shared/ui-lib/Icon";
import { useUITheme } from "shared/lib/uiTheme";

const loginVisibleRoutes = ["/auth/verify", "/auth/sign-up"];
const signUpVisibleRoutes = [
  "/auth/sign-in",
  "/auth/forgot-password",
  "/auth/restore-password",
];

function NavThemeToggle(): React.ReactElement {
  const { theme, toggle } = useUITheme();
  return (
    <button
      className="ThemeToggle"
      onClick={toggle}
      title={
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      }
    >
      {theme === "light" ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 12.5A7.5 7.5 0 1 1 7.5 3a5.5 5.5 0 0 0 9.5 9.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            x1="10"
            y1="1"
            x2="10"
            y2="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="16.5"
            x2="10"
            y2="19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="19"
            y1="10"
            x2="16.5"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="3.5"
            y1="10"
            x2="1"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="16.07"
            y1="3.93"
            x2="14.31"
            y2="5.69"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="5.69"
            y1="14.31"
            x2="3.93"
            y2="16.07"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="16.07"
            y1="16.07"
            x2="14.31"
            y2="14.31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="5.69"
            y1="5.69"
            x2="3.93"
            y2="3.93"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

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
        <div className="NavbarActions">
          {isLoginVisible && (
            <NavLink to={`/auth/sign-in${location.search}`} className={"Link"}>
              {t("auth.signIn")}
            </NavLink>
          )}
          {isSignUpVisible && (
            <NavLink to={`/auth/sign-up${location.search}`} className={"Link"}>
              {t("auth.signUpForFree")}
            </NavLink>
          )}
          <NavThemeToggle />
        </div>
      </header>
      {(lastBoardLink || backToSelect) && (
        <NavLink
          to={!backToSelect ? `/boards/${lastBoardLink}` : "/selectBoard"}
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
