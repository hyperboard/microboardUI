import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { isMicroboardIframe } from "lib/isMicroboardIframe";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { App } from "App";
import { shouldShow } from "lib/queryStringParser";
import { useAppContext } from "View/AppContext";
import { PresenceUsers } from "View/Presence/PresenceUsers/PresenceUsers";
import { UiButton } from "View/Ui/UiButton";
import { UiLink } from "View/Ui/UiLink";
import { UiPanel } from "View/Ui/UiPanel";
import styles from "./UserPanel.module.css";
import { CommentsPanelContextProvider } from "View/UserPanel/CommentsPanel/CommentsPanelContext";
import { CommentsPanel } from "View/UserPanel/CommentsPanel/CommentsPanel";
import { ActionButtons } from "./ActionButtons/ActionButtons.tsx";
import { ShareBtn } from "./Buttons/ShareBtn/ShareBtn.tsx";

export const UserPanel: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { app } = useAppContext();
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
				"!@#"
				<ActionButtons />
				<PresenceUsers app={app} />
				<div className={styles.container}>
					<ShareBtn />
				</div>
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
