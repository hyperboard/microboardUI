import { useAccount } from "App/useAccount";
import { Comment } from "Board/Items/Comment/Comment";
import React, { useState } from "react";
import { useAppContext } from "View/AppContext";
import { Icon } from "../../../Icon";
import { UiButton } from "../../../Ui/UiButton";
import { UiPanel } from "../../../Ui/UiPanel";
import styles from "./ExtraOptions.module.css";
import { notify } from "View/Ui/Toast/notify";
import { useTranslation } from "react-i18next";

interface Props {
	comment: Comment;
	canEdit: boolean;
}

export const ExtraOptions = ({ comment, canEdit }: Props) => {
	const [isCursorOnButton, setIsCursorOnButton] = useState(false);
	const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
	const { board } = useAppContext();
	const account = useAccount();
	const { t } = useTranslation();

	const username = account.info?.name || account.info?.email;

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

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(comment.getLink());
			notify({
				body: t("contextPanel.copyItemLink.success.description"),
				variant: "success",
				duration: 3000,
			});
		} catch (err) {
			console.error(err);
			notify({
				header: t("contextPanel.copyItemLink.error.title"),
				body: t("contextPanel.copyItemLink.error.description"),
				variant: "error",
			});
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
									{t("comment.markAsUnread")}
								</button>
							)}
						<button onClick={handleCopyLink} className={styles.btn}>
							<Icon
								iconName={"CopyLink"}
								width={20}
								height={20}
							/>
							{t("comment.copyLink")}
						</button>
						{canEdit && (
							<button
								className={styles.btn}
								onClick={handleRemove}
							>
								<Icon
									style={{ color: "#696B76" }}
									iconName={"Delete"}
									width={20}
									height={20}
								/>
								{t("comment.deleteThread")}
							</button>
						)}
					</UiPanel>
				</div>
			)}
		</div>
	);
};
