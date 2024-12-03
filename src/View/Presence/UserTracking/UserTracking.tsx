import React, { useEffect, useState } from "react";
import styles from "./UserTracking.module.css";
import clsx from "clsx";
import { Board } from "Board";
import { Presence, PresenceUser } from "Board/Presence/Presence";
import { rgbToRgba } from "Board/Presence/helpers";
import { useTranslation } from "react-i18next";

interface Props {
	board: Board;
}

export const UserTracking: React.FC<Props> = ({ board }) => {
	const { t } = useTranslation();
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
				style={{
					backgroundColor:
						rgbToRgba(trackedUser.color, 0.6) || "#fff",
				}}
			>
				<span>
					{t("presence.followingUser")}{" "}
					{trackedUser.nickname === "Anonymous"
						? t("presence.anonymous")
						: trackedUser.nickname}
				</span>
				<button className={styles.stop} onClick={onStopFollowing}>
					{t("presence.stop")}
				</button>
			</div>
		</div>
	);
};
