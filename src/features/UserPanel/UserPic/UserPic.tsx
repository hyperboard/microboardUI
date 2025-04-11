import { useAccount } from "App/useAccount";
import { PresenceUser } from "Board/Presence/Presence";
import React, { MouseEventHandler, RefObject, useRef } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import {
	FollowingUsersCount,
	User,
} from "features/Presence/PresenceUsers/PresenceUsers";
import { PROFILE_SETTINGS_MODAL_ID } from "features/ProfileSettingsModal";
import { USER_PLAN_MODAL_ID } from "features/UserPlan";
import { Logout } from "../icons/Logout";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { UserDropDown } from "../UserDropdown/UserDropdown";
import styles from "../UserPanel.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { useNavigate } from "react-router-dom";
import { useCommentsPanelContext } from "entities/comments/CommentsPanel/CommentsPanelContext";

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
	const navigate = useNavigate();
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

	const handlePlanModalOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		openModal(USER_PLAN_MODAL_ID);
	};

	const handleLogout: MouseEventHandler = async ev => {
		ev.stopPropagation();
		await account.logout();
		navigate("/");
	};

	return (
		<>
			<div
				className={styles.userPicWrapper}
				{...props}
				ref={userPanelRef}
				onClick={event => {
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
					<UiButton
						type="button"
						key="userDropDown1"
						onClick={handlePlanModalOpen}
						variant="ghost"
						size="lg"
					>
						<Icon iconName="ArrowUpCircle" width={20} height={20} />{" "}
						<span className={styles.userDropDownButton}>
							{t("userPlan.upgradePlan")}
						</span>
					</UiButton>,
					<UiButton
						type="button"
						key="userDropDown2"
						onClick={handleOpenProfileSettings}
						variant="ghost"
						size="lg"
					>
						<Icon width={20} height={20} iconName="human" />{" "}
						<span className={styles.userDropDownButton}>
							{t("profile.title")}
						</span>
					</UiButton>,
					<UiButton
						type="button"
						key="userDropDown3"
						onClick={handleLogout}
						variant="ghost"
						size="lg"
					>
						<Logout />
						<span className={styles.userDropDownButton}>
							{t("profile.logout")}
						</span>
					</UiButton>,
				]}
			/>
		</>
	);
};
