import React, { RefObject, useRef } from "react";
import styles from "../UserPanel.module.css";
import { PresenceUser } from "Board/Presence/Presence";
import { User } from "View/Presence/PresenceUsers/PresenceUsers";
import { useAccount } from "App/useAccount";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { BringToMe } from "View/Presence/BringToMe/BringToMe";

interface UserDropDownProps extends React.HTMLAttributes<HTMLDivElement> {
	email?: string;
	isOpen: boolean;
	setIsDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
	buttons: React.ReactNode[];
	openerRef?: RefObject<HTMLDivElement>;
	customTop?: number;
	followers: PresenceUser[];
	presenceUsers: User[];
}

export const UserDropDown: React.FC<UserDropDownProps> = ({
	setIsDropdownOpen,
	isOpen,
	buttons,
	email,
	openerRef,
	customTop,
	followers,
	presenceUsers,
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
				{presenceUsers.length > 0 && (
					<BringToMe followers={followers} users={presenceUsers} />
				)}
			</div>
		</div>
	);
};
