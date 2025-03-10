import { App } from "App";
import { useAccount } from "App/useAccount";
import {
	Presence,
	PRESENCE_CLEANUP_IDLE_TIMER,
	PresenceUser,
} from "Board/Presence/Presence";
import clsx from "clsx";
import { useCommentsPanelContext } from "entities/comments/CommentsPanel/CommentsPanelContext";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UserPic } from "features/UserPanel/UserPic/UserPic";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getEmailPrefix } from "shared/lib/getEmailPrefix";
import { useClickOutside } from "shared/lib/useClickOutside";
import { EyeIcon } from "./EyeIcon";
import { PresenceUserAvatar } from "./PresenceUserAvatar";
import styles from "./PresenceUsers.module.css";

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
	const account = useAccount();
	const tooltipRef = useClickOutside(() => {
		setIsOpen(false);
	});
	if (!followers.length) {
		return null;
	}

	return (
		<div className={styles.followingCounter}>
			<div
				className={styles.followingCounterIcon}
				onMouseDown={ev => {
					ev.stopPropagation();
				}}
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
					{followers.map(follower => (
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

const USERS_IN_ROW = 3;

export const PresenceUsers: React.FC<Props> = () => {
	const { board } = useAppContext();
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [users, setUsers] = useState<User[]>([]);
	const [followers, setFollowers] = useState<PresenceUser[]>([]);
	const [trackedUser, setTrackedUser] = useState<PresenceUser | null>(null);
	const [displayUsers, setDisplayUsers] = useState(users);
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const account = useAccount();
	const { setIsPanelOpen } = useCommentsPanelContext();

	const needsCollapse = users.length > USERS_IN_ROW;
	useEffect(() => {
		const sortedUsers = [...users]
			.sort((first, second) =>
				selectedUsers.has(first.id) === selectedUsers.has(second.id)
					? 0
					: selectedUsers.has(first.id)
						? -1
						: 1,
			)
			.sort((first, second) =>
				first.idle === second.idle ? 0 : first.idle ? 1 : -1,
			);

		setDisplayUsers(sortedUsers.slice(0, USERS_IN_ROW));
	}, [users, selectedUsers]);

	const selectUser = (userId: string): void => {
		if (board.presence.trackedUser?.userId === userId) {
			board.presence.disableTracking();
			setSelectedUsers(new Set([]));
			return;
		}
		board.presence.enableTracking(userId);
		setSelectedUsers(new Set([userId]));
	};

	const updateUsers = (presence: Presence): void => {
		const now = Date.now();
		const pUsers = presence
			.getUsers(board.getBoardId(), true)
			.map(user => ({
				id: user.userId,
				hardId: user.hardId,
				name: user.nickname,
				color: user.color,
				avatar: user.avatar,
				idle: user.lastActivity < now - PRESENCE_CLEANUP_IDLE_TIMER,
			}));

		const uniqueUsersByHardId = [
			...new Map(
				pUsers
					.filter(user => user.hardId !== null)
					.map(user => [user.hardId, user]),
			).values(),
			...pUsers.filter(user => user.hardId === null),
		];

		setUsers(uniqueUsersByHardId);

		setFollowers(board.presence.getFollowers());
	};

	useEffect(() => {
		const observer = (presence: Presence): void => {
			updateUsers(presence);
			setTrackedUser(presence.trackedUser || null);
		};

		board.presence.subject.subscribe(observer);

		return () => {
			board.presence.subject.unsubscribe(observer);
		};
	}, [board]);

	useEffect(() => {
		updateUsers(board.presence);
	}, [board.getInterfaceType()]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.container}>
				<div className={styles.userList}>
					{displayUsers.map((user, index) => (
						<PresenceUserAvatar
							key={user.id}
							user={user}
							trackedUser={trackedUser}
							index={index}
							onClick={() => selectUser(user.id)}
						/>
					))}

					<UserPic
						className={styles.userWrapper}
						style={{ zIndex: 1000 }}
						followers={followers}
						presenceUsers={users}
						email={
							account.info?.name ??
							getEmailPrefix(
								account.info?.email ?? "",
								"Anonymous",
							)
						}
						setIsDropdownOpen={setIsUserDropdownOpen}
						isDropdownOpen={isUserDropdownOpen}
					/>
					{needsCollapse && (
						<button
							onMouseDown={event => {
								event.stopPropagation();
								if (!isUserDropdownOpen) {
									setIsUserDropdownOpen(true);
									setIsPanelOpen(false);
								} else {
									setIsUserDropdownOpen(false);
									setIsPanelOpen(false);
								}
							}}
							style={
								{
									"--index": displayUsers.length,
								} as React.CSSProperties
							}
							className={styles.usersOverflowWrapper}
						>
							<div className={styles.usersOverflowGap} />
							<div className={styles.usersOverflowCounter}>
								<span>{users.length}</span>
								<Icon
									iconName="StrokeChevronDown"
									width={11}
									height={6}
								/>
							</div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
