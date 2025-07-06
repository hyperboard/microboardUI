import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { isMicroboardIframe } from "shared/lib/isMicroboardIframe.ts";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { App } from "App";
import { shouldShow } from "shared/lib/queryStringParser.ts";
import { useAppContext } from "features/AppContext.tsx";
import { PresenceUsers } from "features/Presence/PresenceUsers/PresenceUsers.tsx";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiLink } from "shared/ui-lib/UiLink/index.ts";
import { UiPanel } from "shared/ui-lib/UiPanel/index.ts";
import styles from "./UserPanel.module.css";
import { ActionButtons } from "./ActionButtons/ActionButtons.tsx";
import { ShareBtn } from "./Buttons/ShareBtn/ShareBtn.tsx";
import { CommentsPanelContextProvider } from "entities/comments/CommentsPanel/CommentsPanelContext.tsx";
import { CommentsPanel } from "entities/comments/CommentsPanel/CommentsPanel.tsx";
import { KeycloakAuthBtn } from "features/KeycloakAuthBtn.tsx";

export const UserPanel: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { app, board } = useAppContext();
	const account = useAccount();

	const insideOfMicroboard =
		document.referrer.includes("https://microboard.io/") ||
		document.referrer.includes("https://microboard.ru/");

	// Проверяем, является ли приложение on-premise версией
	const isOnPremiseVersion = false; // conf.features?.isOnPremise || false;

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
					<div className={styles.unauthBtns}>
						{isOnPremiseVersion ? (
							// On-premise версия - только SSO
							<KeycloakAuthBtn />
						) : // SaaS версия - стандартные кнопки входа и регистрации
						isMicroboardIframe() && insideOfMicroboard ? (
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
								<ShareBtn />
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
								<ShareBtn />
							</>
						)}
					</div>
				</div>
			</UiPanel>
		);
	}

	return (
		<CommentsPanelContextProvider>
			<UiPanel zIndex={10} padding={0} className={styles.wrapper}>
				<ActionButtons />
				<PresenceUsers app={app} />
				{board.getBoardId() !== "blank" && (
					<div className={styles.container}>
						<ShareBtn />
					</div>
				)}
			</UiPanel>
			<CommentsPanel />
		</CommentsPanelContextProvider>
	);
};

export const UserPanelLayout: React.FC<{ app: App }> = () => {
	return (
		<div className={styles.layoutWrapper}>
			{shouldShow("userPanel") && <UserPanel />}
		</div>
	);
};
