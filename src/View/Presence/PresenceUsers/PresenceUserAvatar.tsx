import React from "react";
import clsx from "clsx";
import { rgbToRgba } from "Board/Presence/helpers";
import styles from "./PresenceUsers.module.css";
import { EyeIcon } from "./EyeIcon";
import { useTranslation } from "react-i18next";

interface Props {
	user: {
		id: string;
		name: string;
		color: string;
		avatar: string | null;
		idle: boolean;
	};
	trackedUser: { userId: string } | null;
	index: number;
	onClick: () => void;
}

const TippySvg: React.FC = () => {
	return (
		<svg
			width="14"
			height="4"
			viewBox="0 0 14 4"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M6.9372 0C6.9372 0 3.40535 3.99848 0.0980963 3.99963C-1.46344 4.00017 16.1695 4.00007 13.7763 3.99963C10.2587 3.99898 6.9372 0 6.9372 0Z"
				fill="#0B0C0E"
			/>
		</svg>
	);
};

export const PresenceUserAvatar: React.FC<Props> = ({
	user,
	trackedUser,
	index,
	onClick,
}) => {
	const isTracked = trackedUser?.userId === user.id;
	const { t } = useTranslation();

	return (
		<div
			className={styles.userWrapper}
			style={{ "--index": index } as React.CSSProperties}
			onClick={onClick}
		>
			<div
				className={clsx(
					styles.userAvatar,
					isTracked ? styles.selectedAvatar : "",
					user.idle && !isTracked ? styles.idle : "",
				)}
				style={{
					borderColor: user.color,
					backgroundColor: user.avatar
						? undefined
						: rgbToRgba(user.color, 0.5),
				}}
			>
				{user.avatar ? (
					<img src={user.avatar} alt={user.name} />
				) : (
					user.name.charAt(0)
				)}
				{isTracked && (
					<div
						className={styles.trackedUserOverlay}
						style={{
							backgroundColor:
								rgbToRgba(user.color, 0.5) || user.color,
						}}
					>
						<EyeIcon />
					</div>
				)}
			</div>
			<div className={styles.tooltip}>
				{user.name === "Anonymous"
					? t("presence.anonymous")
					: user.name}
			</div>
			<div className={styles.tippy}>
				<TippySvg />
			</div>
		</div>
	);
};
