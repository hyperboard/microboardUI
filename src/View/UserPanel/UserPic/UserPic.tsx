import React, { MouseEventHandler, RefObject, useRef } from "react";
import { useAppContext } from "View/AppContext";
import { useCommentsPanelContext } from "../CommentsPanel/CommentsPanelContext";
import { useAccount } from "App/useAccount";
import { useUiModalContext } from "View/Ui/UiModal";
import { PROFILE_SETTINGS_MODAL_ID } from "View/ProfileSettingsModal";
import styles from "../UserPanel.module.css";
import { Button } from "shared/ui-lib/Button";
import { Icon } from "View/Icon";
import { PresenceUser } from "Board/Presence/Presence";
import {
	FollowingUsersCount,
	User,
} from "View/Presence/PresenceUsers/PresenceUsers";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { UserDropDown } from "../UserDropdown/UserDropdown";

interface UserDropDownProps extends React.HTMLAttributes<HTMLDivElement> {
	email?: string;
	isOpen: boolean;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	buttons: React.ReactNode[];
	openerRef?: RefObject<HTMLDivElement>;
	customTop?: number;
}

interface UserPicProps extends React.HTMLAttributes<HTMLDivElement> {
	avatar?: string;
	followers: PresenceUser[];
	presenceUsers: User[];
	isDropdownOpen: boolean;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

type TUserPicProps = UserPicProps &
	Omit<
		UserDropDownProps,
		"isOpen" | "setIsDropdownOpen" | "buttons" | "openerRef" | "customTop"
	>;

export const UserPic: React.FC<TUserPicProps> = ({ ...props }) => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const { setIsPanelOpen } = useCommentsPanelContext();
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
					if (!props.isDropdownOpen) {
						props.setIsDropdownOpen(true);
						setIsPanelOpen(false);
					} else {
						props.setIsDropdownOpen(false);
						setIsPanelOpen(false);
					}
				}}
			>
				<UserAvatar
					src={account.info?.avatar}
					isOwner={isOwner}
					tooltip={!props.isDropdownOpen}
					name={account.info?.name}
				/>
				<FollowingUsersCount followers={props.followers} />
			</div>

			<UserDropDown
				openerRef={userPanelRef}
				isOpen={props.isDropdownOpen}
				setIsDropdownOpen={props.setIsDropdownOpen}
				email={props.email}
				followers={props.followers}
				presenceUsers={props.presenceUsers}
				buttons={[
					<Button
						type="button"
						key="userDropDown1"
						onClick={handleOpenProfileSettings}
						pattern="ghost"
					>
						<Icon
							width={20}
							height={20}
							iconName="human"
						/>{" "}
						<span className={styles.userDropDownButton}>
							{t("profile.title")}
						</span>
					</Button>,
				]}
			/>
		</>
	);
};
