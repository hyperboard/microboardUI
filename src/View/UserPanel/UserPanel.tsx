import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { isMicroboardIframe } from "lib/isMicroboardIframe";
import React, {
	RefObject,
	useRef,
	useState,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "View/Icon";
import { App } from "App";
import { useBoardsList } from "App/useBoardsList.ts";
import { getEmailPrefix } from "lib/getEmailPrefix";
import { shouldShow } from "lib/queryStringParser";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { PresenceUsers } from "View/Presence/PresenceUsers/PresenceUsers";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";
import { SHARE_MODAL_ID } from "View/ShareModal/ShareModal";
import { UiButton } from "View/Ui/UiButton";
import { UiLink } from "View/Ui/UiLink";
import { useUiModalContext } from "View/Ui/UiModal";
import { UiPanel } from "View/Ui/UiPanel";
import { PasswordChanged } from "View/Widgets/form-notifications/password-changed";
import styles from "./UserPanel.module.css";
import { AddComment } from "./Buttons/AddComment/AddComment.tsx";
import {
	CommentsPanelContextProvider,
	useCommentsPanelContext,
} from "View/UserPanel/CommentsPanel/CommentsPanelContext";
import { CommentsPanel } from "View/UserPanel/CommentsPanel/CommentsPanel";
import { useCommentsContext } from "View/CommentsProvider/CommentsContext";
import { Click } from "./icons/Click.tsx";

interface UserDropDownProps extends React.HTMLAttributes<HTMLDivElement> {
	email?: string;
	isOpen: boolean;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	buttons: React.ReactNode[];
	openerRef?: RefObject<HTMLDivElement>;
	customTop?: number;
}

// TODO each file for each component
export const UserDropDown: React.FC<UserDropDownProps> = ({
	setIsDropdownOpen,
	isOpen,
	buttons,
	email,
	customTop,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const account = useAccount();

	const closeDropdown = (): void => {
		setIsDropdownOpen(false);
	};

	useOutsideClickHandler(dropdownRef, closeDropdown);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className={styles.dropdownWrapper}
			ref={dropdownRef}
			style={{ top: customTop }}
		>
			{email && (
				<div className={styles.userInfo}>
					<UserAvatar
						src={account.info?.avatar}
						width={40}
						height={40}
					/>
					<p className={styles.userName}>{email}</p>
				</div>
			)}
			<div className={styles.dropdownBtns}>
				{buttons.filter(React.isValidElement).map((button, index) => {
					return React.cloneElement(
						button as React.ReactElement<HTMLButtonElement>,
						{
							className: styles.dropdownBtn,
							key: index,
						},
					);
				})}
			</div>
		</div>
	);
};

type UserAvatarProps = {
	isOwner?: boolean;
	width?: number;
	height?: number;
	tooltip?: boolean;
	src?: string;
	name?: string;
};

export const UserAvatar = ({
	isOwner = false,
	src,
	width,
	height,
	tooltip = false,
	name,
}: UserAvatarProps) => {
	const account = useAccount();
	return (
		<div
			style={{ width, height }}
			className={clsx(styles.userPic, isOwner && styles.owner)}
		>
			{account.isLoggedIn && src ? (
				<img width={width} height={height} src={src} />
			) : (
				<Icon iconName="UserPic" width={12} height={15} />
			)}
			{isOwner && (
				<Icon
					className={styles.crown}
					iconName="Crown"
					width={12}
					height={12}
				/>
			)}
			{tooltip && (
				<div className={styles.tooltipWrapper}>
					<div className={styles.tooltip}>
						<span className={styles.tooltipName}>{name} (you)</span>
						{isOwner && (
							<span className={styles.tooltipMsg}>
								Your board
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

type TUserPicProps = Omit<
	UserDropDownProps,
	"isOpen" | "setIsDropdownOpen" | "buttons" | "openerRef" | "customTop"
>;

// TODO each file for each component
const UserPic: React.FC<TUserPicProps> = ({ ...props }) => {
	const { board } = useAppContext();
	const { setIsPanelOpen } = useCommentsPanelContext();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const userPanelRef = useRef<HTMLDivElement>(null);
	const account = useAccount();
	const { openModal } = useUiModalContext();
	const boardId = board.getBoardId();
	const isOwner = account.permissions.checkPermissions(
		"owns",
		"boards",
		boardId,
	);

	const handleOpenProfileSettings: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		openModal(PROFILE_SETTINGS_MODAL_ID);
	};

	return (
		<>
			<div
				className={styles.userPicWrapper}
				{...props}
				ref={userPanelRef}
				onMouseDown={event => {
					event.stopPropagation();
					if (!isDropdownOpen) {
						setIsDropdownOpen(true);
						setIsPanelOpen(false);
					} else {
						setIsDropdownOpen(false);
						setIsPanelOpen(false);
					}
				}}
			>
				<UserAvatar
					src={account.info?.avatar}
					isOwner={isOwner}
					tooltip
					name={account.info?.name}
				/>
			</div>
			<UserDropDown
				openerRef={userPanelRef}
				isOpen={isDropdownOpen}
				setIsDropdownOpen={setIsDropdownOpen}
				email={props.email}
				buttons={[
					<Button
						type="button"
						key="userDropDown1"
						onClick={handleOpenProfileSettings}
						pattern="ghost"
					>
						<Icon width={20} height={20} iconName="human" /> Profile
						settings
					</Button>,
				]}
			/>
		</>
	);
};

const ShareBtn = () => {
	const { setIds } = useContextMenuContext();
	const { openModal } = useUiModalContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const boardsList = useBoardsList();

	const boardId = board.getBoardId();
	const boardInfo = boardsList.getBoardInfo(boardId);

	const handleShare: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIds(boardId);
		openModal(SHARE_MODAL_ID);
	};
	if (boardId === "blank") {
		return null;
	}

	return (
		<Button
			onClick={handleShare}
			pattern="primary"
			className={styles.shareButton}
		>
			<Icon
				width={16}
				height={16}
				iconName={boardInfo?.isPublic ? "publicDrafts" : "People"}
			/>
			{t("sharing.share")}
		</Button>
	);
};

export const UserPanel: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { app, board } = useAppContext();
	const account = useAccount();
	const [cursorsActive, setCursorsActive] = useState(true);

	const insideOfMicroboard =
		document.referrer.includes("https://microboard.io/") ||
		document.referrer.includes("https://microboard.ru/");
	const isBoardOpen = board.getBoardId() !== "blank";

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
								<p className={styles.unauthMsg}>
									Don&apos;t lose your progress.
								</p>
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
								<p className={styles.unauthMsg}>
									Don&apos;t lose your progress.
								</p>
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
				{isBoardOpen && (
					<>
						<div className={styles.icons}>
							<button
								className={clsx(
									styles.icon,
									cursorsActive && styles.iconActive,
								)}
								onClick={() => {
									const cursorsEnabled = app
										.getBoard()
										.presence.toggleCursorsRendering();

									setCursorsActive(cursorsEnabled);
								}}
							>
								<Click />
							</button>
						</div>

						<PresenceUsers app={app} />
					</>
				)}

				{/* <Button className={styles.btn} pattern="primary">
					<UserShare />
					Share
				</Button> */}

				{/* TODO: remove temporarily inline style */}
				{(account.info?.name || account.info?.email) && isBoardOpen && (
					<AddComment />
				)}
				<div className={styles.container}>
					<ShareBtn />
					<UserPic
						email={
							account.info?.name ??
							getEmailPrefix(
								account.info?.email ?? "",
								"Anonymous",
							)
						}
					/>
				</div>
			</UiPanel>
			<CommentsPanel />
		</CommentsPanelContextProvider>
	);
};

export const UserPanelLayout: React.FC<{ app: App }> = ({ app }) => {
	return (
		<div className={styles.layoutWrapper}>
			{shouldShow("userPanel") && <UserPanel app={app} />}
		</div>
	);
};
