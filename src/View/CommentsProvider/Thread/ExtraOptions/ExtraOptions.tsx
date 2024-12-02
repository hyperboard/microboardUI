import React, { useState } from "react";
import { UiButton } from "../../../Ui/UiButton";
import { Icon } from "../../../Icon";
import { UiPanel } from "../../../Ui/UiPanel";
import styles from "./ExtraOptions.module.css";
import { useAppContext } from "View/AppContext";
import { Comment } from "Board/Items/Comment/Comment";

interface Props {
	comment: Comment;
	canEdit: boolean;
}

export const ExtraOptions = ({ comment, canEdit }: Props) => {
	const [isCursorOnButton, setIsCursorOnButton] = useState(false);
	const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
	const { board, app } = useAppContext();

	const username = app.account.info?.name || app.account.info?.email;

	const handleRemove = () => {
		board.remove(comment);
	};

	const handleMarkAsUnread = () => {
		comment.markThreadAsUnread(username!);
	};

	const handleMouseLeave = (element: "menu" | "btn") => {
		if (element === "btn") {
			setIsCursorOnButton(false);
		}
		if (element === "menu") {
			setIsCursorOnMenu(false);
		}
	};

	return (
		<div className={styles.container}>
			<UiButton
				size="sm"
				variant="secondary"
				onMouseEnter={() => setIsCursorOnButton(true)}
				onMouseLeave={() => handleMouseLeave("btn")}
				style={{
					padding: 0,
					color: "#696B76",
				}}
			>
				<Icon iconName="Dots" width={20} height={20} />
			</UiButton>
			{(isCursorOnButton || isCursorOnMenu) && (
				<div
					className={styles.panelContainer}
					onMouseEnter={() => setIsCursorOnMenu(true)}
					onMouseLeave={() => handleMouseLeave("menu")}
				>
					<UiPanel className={styles.panel} vertical={true}>
						{username &&
							!comment.getIsThreadMarkedAsUnread(username) && (
								<button
									className={styles.btn}
									onClick={handleMarkAsUnread}
								>
									<Icon
										iconName={"MarkAsUnreadComment"}
										width={20}
										height={20}
									/>
									Mark as unread
								</button>
							)}
						{canEdit && (
							<button
								className={styles.btn}
								onClick={handleRemove}
							>
								<Icon
									iconName={"Delete"}
									width={20}
									height={20}
								/>
								Remove
							</button>
						)}
						<button className={styles.btn}>
							<Icon
								iconName={"CopyLink"}
								width={20}
								height={20}
							/>
							Copy link
						</button>
					</UiPanel>
				</div>
			)}
		</div>
	);
};
