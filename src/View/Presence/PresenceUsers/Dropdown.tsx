import React, { useRef } from "react";
import clsx from "clsx";
import { rgbToRgba } from "Board/Presence/helpers";
import styles from "./PresenceUsers.module.css";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";

interface Props {
	users: {
		id: string;
		name: string;
		color: string;
		avatar: string | null;
		idle: boolean;
	}[];
	ref?: React.RefObject<HTMLDivElement>;
	trackedUser: { userId: string } | null;
	selectedUsers: Set<string>;
	onUserSelect: (userId: string) => void;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Dropdown: React.FC<Props> = ({
	users,
	trackedUser,
	selectedUsers,
	onUserSelect,
	setIsOpen,
}) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	useOutsideClickHandler(dropdownRef, () => {
		setIsOpen(false);
	});
	return (
		<div className={styles.dropdown} ref={dropdownRef}>
			{users.map(user => (
				<div
					key={user.id}
					className={styles.dropdownItem}
					onClick={() => onUserSelect(user.id)}
				>
					{user.avatar ? (
						<img
							src={user.avatar}
							width={32}
							height={32}
							className={clsx(styles.dropdownAvatar, {
								[styles.dropdownSelectedAvatar]:
									trackedUser?.userId === user.id,
							})}
							alt={user.name}
						/>
					) : (
						<div
							className={clsx(styles.dropdownAvatar, {
								[styles.dropdownSelectedAvatar]:
									trackedUser?.userId === user.id,
							})}
							style={{
								borderColor: user.color,
								backgroundColor: rgbToRgba(user.color, 0.5),
							}}
						>
							{user.name.charAt(0)}
						</div>
					)}
					<span>{user.name}</span>
				</div>
			))}
		</div>
	);
};
