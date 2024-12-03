import { App } from "App";
import { useAccount } from "App/useAccount";
import {
	Presence,
	PRESENCE_CLEANUP_IDLE_TIMER,
	PresenceUser,
} from "Board/Presence/Presence";
import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { Button } from "shared/ui-lib/Button";
import { Input } from "shared/ui-lib/Input";
import { Icon } from "View/Icon";
import { Dropdown } from "./Dropdown";
import { EyeIcon } from "./EyeIcon";
import styles from "./PresenceUsers.module.css";
import { UserAvatar } from "./UserAvatar";

export interface User {
	id: string;
	name: string;
	color: string;
	avatar: string | null;
	idle: boolean;
}

interface Props {
	app: App;
}

export const FollowingUsersCount: React.FC<{
	followers: PresenceUser[];
}> = ({ followers }) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const account = useAccount();
	useOutsideClickHandler(tooltipRef, () => {
		setIsOpen(false);
	});
	if (!followers.length) {
		return null;
	}

	return (
		<div className={styles.followingCounter}>
			<div
				className={styles.followingCounterIcon}
				onClick={() => {
					if (isOpen) {
						return;
					}
					setIsOpen(!isOpen);
				}}
			>
				<EyeIcon fill={"white"} />
				<span>{followers.length}</span>
			</div>
			<div
				ref={tooltipRef}
				className={clsx(
					styles.followersTooltip,
					isOpen && styles.followersVisible,
				)}
			>
				<p className={styles.followersMe}>
					{account.info?.email} {t("presence.(you)")}
				</p>
				<span className={styles.followersBoard}>
					{t("presence.yourBoard")}
				</span>
				<div className={styles.followersHr} />
				<div className={styles.followersList}>
					{followers.map((follower, index) => (
						<span
							key={follower.userId}
							className={styles.followersItem}
						>
							{follower.nickname} {t("presence.following")}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};

const ShareModal: React.FC<{
	setIsShareModalOpen: (isOpen: boolean) => void;
	followers: PresenceUser[];
	app: App;
	users: User[];
}> = ({ setIsShareModalOpen, followers, app, users }) => {
	const { t } = useTranslation();
	const modalRef = useRef<HTMLDivElement>(null);

	useOutsideClickHandler(modalRef, () => {
		setIsShareModalOpen(false);
	});
	return (
		<div className={styles.shareModal} ref={modalRef}>
			<Input
				id="searchNicknameId"
				placeholder="Search by name"
				prefixIcon={<Icon iconName="Search" height={16} width={16} />}
				onKeyDown={ev => {
					ev.stopPropagation();
				}}
			/>
			<div className={styles.shareList}>
				{users.map(user => (
					<div key={user.id} className={styles.shareUser}>
						{user?.avatar ? (
							<img
								src={user.avatar}
								className={styles.shareUserPic}
							/>
						) : (
							<div
								className={styles.shareUserPic}
								style={{ backgroundColor: user.color }}
							>
								{user.name.charAt(0).toUpperCase()}
							</div>
						)}

						<span>{user.name}</span>
					</div>
				))}
			</div>
			<Button
				onClick={() => {
					const presence = app.getBoard().presence;
					const allUsers = presence.getUsers(true);
					if (allUsers.length > 0) {
						presence.emit({
							method: "BringToMe",
							timestamp: Date.now(),
							users: allUsers.map(user => user.userId),
						});
					}
				}}
			>
				{t("presence.bringToMe")}
			</Button>
			{followers.length > 0 && (
				<Button
					pattern="secondary"
					onClick={() => {
						const presence = app.getBoard().presence;
						presence.emit({
							method: "StopFollowing",
							timestamp: Date.now(),
							users: followers.map(follower => follower.userId),
						});
					}}
				>
					{t("presence.stop")} {followers.length}{" "}
					{followers?.length > 1
						? t("presence.followers")
						: t("presence.follower")}
				</Button>
			)}
		</div>
	);
};

const USERS_IN_ROW = 2;
export const PresenceUsers: React.FC<Props> = ({ app }) => {
	const board = app.getBoard();
	const { t } = useTranslation();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [users, setUsers] = useState<User[]>([]);
	const [followers, setFollowers] = useState<PresenceUser[]>([]);
	const [trackedUser, setTrackedUser] = useState<PresenceUser | null>(null);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [sortedUsers, setSortedUsers] = useState(users);
	const [displayUsers, setDisplayUsers] = useState(users);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useOutsideClickHandler(dropdownRef, () => {
		setIsDropdownOpen(false);
	});

	const needsCollapse = users.length > USERS_IN_ROW;
	useEffect(() => {
		// eslint-disable-next-line id-length
		const sortedUsers = [...users].sort((a, b) =>
			selectedUsers.has(a.id) === selectedUsers.has(b.id)
				? 0
				: selectedUsers.has(a.id)
					? -1
					: 1,
		);
		setSortedUsers(sortedUsers);
		setDisplayUsers(sortedUsers.slice(0, USERS_IN_ROW));
	}, [users]);

	const selectUser = (userId: string): void => {
		board.presence.enableTracking(userId);
		setSelectedUsers(new Set([userId]));
		setIsDropdownOpen(false);
	};

	const updateUsers = (): void => {
		const now = Date.now();
		setUsers(
			board.presence.getUsers(true).map(user => ({
				id: user.userId,
				name: user.nickname,
				color: user.color,
				avatar: user.avatar,
				idle: user.lastActivity < now - PRESENCE_CLEANUP_IDLE_TIMER,
			})),
		);

		setFollowers(board.presence.getFollowers());
	};

	useEffect(() => {
		updateUsers();
		board.presence.subject.subscribe((presence: Presence) => {
			updateUsers();
			setTrackedUser(presence.trackedUser || null);
		});
	}, []);

	if (!users?.length) {
		return null;
	}

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<div className={styles.userList}>
					{displayUsers.map((user, index) => (
						<UserAvatar
							key={user.id}
							user={user}
							trackedUser={trackedUser}
							index={index}
							onClick={() => selectUser(user.id)}
						/>
					))}
					{needsCollapse && (
						<button
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							style={
								{
									"--index": displayUsers.length,
								} as React.CSSProperties
							}
							className={styles.userWrapper}
						>
							<div
								className={`${styles.userAvatar} ${styles.userCounter}`}
							>
								{users.length}
							</div>
						</button>
					)}
				</div>
				{/* <Button
					className={styles.btn}
					pattern="primary"
					onClick={() => {
						if (isShareModalOpen) {
							return;
						}
						setIsShareModalOpen(true);
					}}
				>
					<UserShare />
					{t("presence.share")}
				</Button> */}
				{isShareModalOpen && (
					<ShareModal
						setIsShareModalOpen={setIsShareModalOpen}
						followers={followers}
						users={users}
						app={app}
					/>
				)}
				{isDropdownOpen && needsCollapse && (
					<Dropdown
						ref={dropdownRef}
						users={users}
						trackedUser={trackedUser}
						selectedUsers={selectedUsers}
						onUserSelect={selectUser}
						setIsOpen={setIsDropdownOpen}
					/>
				)}
			</div>
			<FollowingUsersCount followers={followers} app={app} />
		</div>
	);
};
