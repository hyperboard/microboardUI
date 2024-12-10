import React, { CSSProperties, useState } from "react";
import styles from "./Avatar.module.css";
import { Icon } from "View/Icon/Icon";
import clsx from "clsx";

interface Props {
	avatar?: string;
	width?: number;
	height?: number;
	style?: CSSProperties;
	classname?: string;
}

export const Avatar: React.FC<Props> = ({
	avatar,
	width = 20,
	height = 20,
	style,
	classname,
}) => {
	const [isAvatar, setIsAvatar] = useState<boolean>(!!avatar);

	return (
		<div
			className={clsx(styles.avatar, classname)}
			style={{ minWidth: width, maxWidth: width, height, ...style }}
		>
			{isAvatar ? (
				<img
					src={avatar}
					className={styles.noPointerEvents}
					onError={() => setIsAvatar(false)}
				/>
			) : (
				<Icon
					className={styles.noPointerEvents}
					iconName="UserPic"
					width={12}
					height={15}
				/>
			)}
		</div>
	);
};
