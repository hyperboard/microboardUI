import { useAccount } from "App/useAccount";
import clsx from "clsx";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../UserPanel.module.css";
import { Icon } from "View/Icon";

type UserAvatarProps = {
	isOwner?: boolean;
	width?: number;
	height?: number;
	tooltip?: boolean;
	src?: string;
	name?: string;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
	isOwner = false,
	src,
	width,
	height,
	tooltip = false,
	name,
}) => {
	const { t } = useTranslation();
	const account = useAccount();
	return (
		<div
			style={{ width, height }}
			className={clsx(styles.userPic, isOwner && styles.owner)}
		>
			<div className={styles.imgWrapper} style={{ width, height }}>
				{account.isLoggedIn && src ? (
					<img width={width} height={height} src={src} />
				) : (
					<Icon iconName="UserPic" width={12} height={15} />
				)}
				{isOwner && (
					<Icon
						className={styles.crown}
						iconName="Crown"
						width={12}
						height={12}
					/>
				)}
			</div>
			{tooltip && (
				<div className={styles.tooltipWrapper}>
					<div className={styles.tooltip}>
						<span className={styles.tooltipName}>{name} (you)</span>
						{isOwner && (
							<span
								style={{ color: "white" }}
								className={styles.tooltipMsg}
							>
								{t("userPanel.yourBoard")}
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
