import React, { useEffect, useState } from "react";
import styles from "./UserTracking.module.css";
import clsx from "clsx";
import { Board } from "Board";
import { Presence, PresenceUser } from "Board/Presence/Presence";

interface Props {
	board: Board;
}

export const UserTracking: React.FC<Props> = ({ board }) => {
	const [trackedUser, setTrackedUser] = useState<PresenceUser | null>(null);

	const onStopFollowing = (): void => {
		board.presence.disableTracking();
	};

	useEffect(() => {
		board.presence.subject.subscribe((presence: Presence) => {
			if (presence.trackedUser) {
				setTrackedUser(presence.trackedUser);
			} else {
				setTrackedUser(null);
			}
		});
	}, []);

	if (!trackedUser) {
		return null;
	}

	return (
		<div
			className={styles.wrapper}
			style={{ borderColor: trackedUser.color }}
		>
			<div
				className={styles.header}
				style={{ backgroundColor: trackedUser.color }}
			>
				<span
					className={clsx(styles.svgContainer, styles.svgLeft)}
					style={{
						color: trackedUser.color,
						transition: "fill 0.1s linear",
					}}
				>
					<svg
						className="svg"
						xmlns="http://www.w3.org/2000/svg"
						width="6"
						height="6"
						viewBox="0 0 6 6"
					>
						<path
							fill="currentColor"
							d="M1 0c2.5 0 5 2.5 5 5V0H1"
						></path>
					</svg>
				</span>
				<span>Following user {trackedUser.nickname}</span>
				<button className={styles.stop} onClick={onStopFollowing}>
					Stop
				</button>
				<span
					className={clsx(styles.svgContainer, styles.svgRight)}
					style={{
						color: trackedUser.color,
						transition: "fill 0.1s linear",
					}}
				>
					<svg
						className="svg"
						xmlns="http://www.w3.org/2000/svg"
						width="6"
						height="6"
						viewBox="0 0 6 6"
					>
						<path
							fill="currentColor"
							d="M5 0C2.5 0 0 2.5 0 5V0h5"
						></path>
					</svg>
				</span>
			</div>
		</div>
	);
};
