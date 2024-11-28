import React, { useEffect, useState } from "react";
import styles from "./PresenceUsers.module.css";
import { Board } from "Board";
import { UiPanel } from "View/Ui/UiPanel";
import { Presence, PresenceUser } from "Board/Presence/Presence";
// import { mockUsers } from "./mock";
import clsx from "clsx";
import { rgbToRgba } from "Board/Presence/helpers";

export interface User {
	id: string;
	name: string;
	color: string;
	avatar: string | null;
}

interface Props {
	board: Board;
}

export const PresenceUsers: React.FC<Props> = ({ board }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
	const [users, setUsers] = useState<User[]>([]);
	const [trackedUser, setTrackedUser] = useState<PresenceUser | null>(null);

	const needsCollapse = users.length > 3;

	// Sort users to show selected ones first
	const sortedUsers = [...users].sort((first, second) => {
		const aSelected = selectedUsers.has(first.id);
		const bSelected = selectedUsers.has(second.id);
		if (aSelected === bSelected) {
			return 0;
		}
		return aSelected ? -1 : 1;
	});

	const displayUsers = sortedUsers.slice(0, 2);

	const selectUser = (userId: string): void => {
		board.presence.enableTracking(userId);

		setSelectedUsers(new Set([userId]));
		setIsDropdownOpen(false);
	};

	useEffect(() => {
		setUsers(
			board.presence.getUsers(true).map(user => ({
				id: user.userId,
				color: user.color,
				name: user.nickname,
				avatar: user.avatar,
			})),
		);
		board.presence.subject.subscribe((presence: Presence) => {
			setUsers(
				board.presence.getUsers(true).map(user => ({
					id: user.userId,
					color: user.color,
					name: user.nickname,
					avatar: user.avatar,
				})),
			);
			if (presence.trackedUser) {
				setTrackedUser(presence.trackedUser);
			} else {
				setTrackedUser(null);
			}
		});
	}, []);

	if (!users?.length) {
		return null;
	}

	return (
		<UiPanel padding={0} className={styles.wrapper}>
			<div className={styles.container}>
				<div className={styles.userList}>
					{displayUsers.map((user, index) => (
						<div
							key={user.id}
							className={styles.userWrapper}
							style={{ "--index": index }}
							onClick={() => selectUser(user.id)}
						>
							{user?.avatar ? (
								<img
									src={user.avatar}
									width={32}
									height={32}
									style={{ borderColor: user.color }}
									className={`${styles.userAvatar} ${trackedUser?.userId === user.id ? styles.selectedAvatar : ""}`}
								/>
							) : (
								<div
									className={`${styles.userAvatar} ${trackedUser?.userId === user.id ? styles.selectedAvatar : ""}`}
									style={{
										borderColor: user.color,
										backgroundColor:
											rgbToRgba(user.color, 0.5) ||
											user.color,
									}}
								>
									{user.name.charAt(0)}
								</div>
							)}
							<div className={styles.tooltip}>{user.name}</div>
						</div>
					))}

					{needsCollapse && (
						<button
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							style={{ "--index": displayUsers.length }}
							className={clsx(styles.userWrapper)}
						>
							<div
								className={clsx(
									styles.userAvatar,
									styles.userCounter,
								)}
							>
								{users.length}
							</div>
						</button>
					)}
				</div>

				{isDropdownOpen && needsCollapse && (
					<div className={styles.dropdown}>
						{users.map(user => (
							<div
								key={user.id}
								className={styles.dropdownItem}
								onClick={() => selectUser(user.id)}
							>
								{user?.avatar ? (
									<img
										src={user.avatar}
										width={32}
										height={32}
										className={`${styles.dropdownAvatar} ${trackedUser?.userId === user.id ? styles.dropdownSelectedAvatar : ""}`}
									/>
								) : (
									<div
										className={`${styles.dropdownAvatar} ${trackedUser?.userId === user.id ? styles.dropdownSelectedAvatar : ""}`}
										style={{
											backgroundColor:
												rgbToRgba(user.color, 0.5) ||
												user.color,
										}}
									>
										{user.name.charAt(0)}
									</div>
								)}
								<span className={styles.userName}>
									{user.name}
								</span>
								{selectedUsers.has(user.id) && (
									<div className={styles.selectedIndicator} />
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</UiPanel>
	);
};
