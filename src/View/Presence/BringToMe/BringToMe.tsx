import { Presence, PresenceUser } from "Board/Presence/Presence";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { User } from "../PresenceUsers/PresenceUsers";
import { useAppContext } from "View/AppContext";
import { useTranslation } from "react-i18next";
import commonStyles from "../PresenceUsers/PresenceUsers.module.css";
import styles from "./BringToMe.module.css";
import { Input } from "shared/ui-lib/Input";
import { Icon } from "View/Icon";
import { rgbToRgba } from "Board/Presence/helpers";
import { UiButton } from "View/Ui/UiButton";
import clsx from "clsx";
import { notify } from "View/Ui/Toast";
import i18next from "i18next";
import { EyeIcon } from "../PresenceUsers/EyeIcon";

interface UserActionsDropdownProps {
	userId: string;
	onClose: () => void;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
	userId,
	onClose,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { board } = useAppContext();
	const { t } = useTranslation();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [onClose]);

	const handleFollowUser = (ev): void => {
		ev.stopPropagation();
		board.presence.enableTracking(userId);
		onClose();
	};

	const handleBringToMe = (ev): void => {
		ev.stopPropagation();
		board.presence.emit({
			method: "BringToMe",
			users: [userId],
			timestamp: Date.now(),
		});
		const user = board.presence.users.get(userId);
		if (!user) {
			onClose();
			return;
		}
		notify({
			header:
				i18next.t("presence.bringNotify1") +
				" " +
				user?.nickname +
				" " +
				i18next.t("presence.bringNotify2"),
			variant: "black",
			duration: 3_000,
			unclosable: true,
			position: "bottom-center",
		});
		onClose();
	};

	return (
		<div ref={dropdownRef} className={styles.userActionsDropdown}>
			<UiButton
				className={styles.dropdownButton}
				size="sm"
				radius="md"
				variant="secondary"
				onClick={handleFollowUser}
				onMouseDown={ev => {
					ev.stopPropagation();
				}}
			>
				<Icon
					iconName="FollowUser"
					width={16}
					height={16}
					className={styles.icon}
				/>
				<span>{t("presence.followUser")}</span>
			</UiButton>
			<UiButton
				className={styles.dropdownButton}
				size="sm"
				radius="md"
				variant="secondary"
				onClick={handleBringToMe}
				onMouseDown={ev => {
					ev.stopPropagation();
				}}
			>
				<Icon
					iconName="BringToMe"
					width={16}
					height={16}
					className={styles.icon}
				/>
				<span>{t("presence.bringToMe...")}</span>
			</UiButton>
		</div>
	);
};

export const BringToMe: React.FC<{
	followers: PresenceUser[];
	users: User[];
}> = ({ followers, users }) => {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const modalRef = useRef<HTMLDivElement>(null);
	const [trackedUser, setIsTrackedUser] = useState<PresenceUser | null>();
	const [openDropdownUserId, setOpenDropdownUserId] = useState<string | null>(
		null,
	);
	const [searchTerm, setSearchTerm] = useState<string>("");

	useEffect(() => {
		const observer = (presence: Presence): void => {
			setIsTrackedUser(presence.trackedUser || null);
		};

		board.presence.subject.subscribe(observer);

		return () => {
			board.presence.subject.unsubscribe(observer);
		};
	});

	const filteredUsers = useMemo(() => {
		return users.filter(user =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [users, searchTerm]);

	return (
		<div className={commonStyles.shareModal} ref={modalRef}>
			<div className={commonStyles.shareModalSearch}>
				<Input
					id="searchNicknameId"
					placeholder={t("presence.searchByName")}
					prefixIcon={
						<Icon
							iconName="Search"
							height={16}
							width={16}
							className={commonStyles.shareModalSearchIcon}
						/>
					}
					onKeyDown={ev => {
						ev.stopPropagation();
					}}
					onChange={ev => {
						setSearchTerm(ev.target.value);
						setOpenDropdownUserId(null);
					}}
				/>
			</div>

			<div className={commonStyles.shareList}>
				{filteredUsers.map(user => (
					<div
						key={user.id}
						className={`${commonStyles.shareUser} ${styles.userListItem}`}
						onClick={() => {
							if (trackedUser && trackedUser.userId !== user.id) {
								board.presence.enableTracking(user.id);
							}
							if (trackedUser) {
								board.presence.disableTracking();
								return;
							}
							board.presence.enableTracking(user.id);
						}}
					>
						{user?.avatar ? (
							<img
								src={user.avatar}
								className={clsx(
									commonStyles.shareUserPic,
									user.idle && styles.idleAvatar,
								)}
								style={{
									border: `1px solid ${
										trackedUser &&
										trackedUser.userId === user.id
											? user.color
											: "transparent"
									}`,
								}}
							/>
						) : (
							<div
								className={clsx(
									commonStyles.shareUserPic,
									user.idle && styles.idleAvatar,
								)}
								style={{
									backgroundColor: rgbToRgba(user.color, 0.5),
									border: `1px solid ${
										trackedUser &&
										trackedUser.userId === user.id
											? user.color
											: "transparent"
									}`,
								}}
							>
								{user.name.charAt(0).toUpperCase()}
							</div>
						)}

						{trackedUser && trackedUser.userId === user.id && (
							<div className={commonStyles.shareEye}>
								<EyeIcon />
							</div>
						)}

						<span className={styles.nickname}>
							{user.name}{" "}
							{user.idle && "(" + t("presence.idle") + ")"}
						</span>
						<div className={styles.userActionsContainer}>
							<UiButton
								className={styles.btn}
								size="md"
								radius="md"
								variant="secondary"
								onMouseDown={ev => {
									ev.stopPropagation();
									setOpenDropdownUserId(
										openDropdownUserId === user.id
											? null
											: user.id,
									);
								}}
								onClick={ev => {
									ev.stopPropagation();
								}}
							>
								<Icon
									iconName="ThreeDots"
									width={20}
									height={20}
								/>
							</UiButton>
							{openDropdownUserId === user.id && (
								<UserActionsDropdown
									userId={user.id}
									onClose={() => setOpenDropdownUserId(null)}
								/>
							)}
						</div>
					</div>
				))}
			</div>
			{filteredUsers.length === 0 && searchTerm && (
				<div className={styles.noResults}>
					<span>{t("presence.noUsersFound")}</span>
					<p className={styles.noResultsTerm}>
						&quot;{searchTerm}&quot;
					</p>
					<span>{t("presence.noUsersFoundPostfix")}</span>
				</div>
			)}
			<UiButton
				size="md"
				className={styles.btnBring}
				onClick={() => {
					const presence = board.presence;
					const allUsers = presence.getUsers(
						board.getBoardId(),
						true,
					);
					const uniqueUsersByHardId = [
						...new Map(
							allUsers
								.filter(user => user.hardId !== null)
								.map(user => [user.hardId, user]),
						).values(),
						...allUsers.filter(user => user.hardId === null),
					];
					if (uniqueUsersByHardId.length > 0) {
						presence.emit({
							method: "BringToMe",
							timestamp: Date.now(),
							users: uniqueUsersByHardId.map(user => user.userId),
						});
						notify({
							header: t("presence.bringAllNotify"),
							variant: "black",
							duration: 3_000,
							unclosable: true,
							position: "bottom-center",
						});
					}
				}}
			>
				{t("presence.bringToMe")}
			</UiButton>
			{followers.length > 0 && (
				<UiButton
					className={styles.btnStop}
					variant="secondary"
					size="md"
					onClick={() => {
						const presence = board.presence;
						presence.emit({
							method: "StopFollowing",
							timestamp: Date.now(),
							users: followers.map(follower => follower.userId),
						});
					}}
				>
					<Icon
						iconName="EyeDashed"
						width={16}
						height={16}
						style={{ color: "#696B76" }}
					/>{" "}
					{t("presence.stop")} {followers.length}{" "}
					{followers?.length > 1
						? t("presence.followers")
						: t("presence.follower")}
				</UiButton>
			)}
		</div>
	);
};
