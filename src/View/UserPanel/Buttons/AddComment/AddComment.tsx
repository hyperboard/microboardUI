import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon/index";
import { UiButton } from "View/Ui/UiButton/index";
import React from "react";
import { useTranslation } from "react-i18next";
import { useForceUpdate } from "lib/useForceUpdate";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useCommentsPanelContext } from "View/UserPanel/CommentsPanel/CommentsPanelContext";
import styles from "./AddComment.module.css";
import { useAccount } from "App/useAccount";

export function AddComment() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const { setIsPanelOpen } = useCommentsPanelContext();
	const isActive = Boolean(board.tools.getAddComment());
	const account = useAccount();

	const forceUpdate = useForceUpdate();
	useAppSubscription({
		subjects: ["tools", "items"],
		observer: forceUpdate,
	});

	const userId = account.info?.id;

	let showBadge = !!userId;
	if (userId) {
		showBadge = board.items.getComments().some(comment => {
			return (
				comment.getIsThreadMarkedAsUnread(userId) ||
				comment.getUnreadMessages(userId)
			);
		});
	}

	const handleClick = (): void => {
		if (isActive) {
			setIsPanelOpen(false);
		} else {
			setIsPanelOpen(true);
		}
		board.tools.addComment(true);
	};

	return (
		<UiButton
			className={styles.btn}
			id={"tool-add-comment"}
			tooltipPosition={"bottom"}
			tooltip={isActive ? undefined : t("userPanel.comment")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded="left"
		>
			<Icon iconName="Comment" width={20} height={20} />
			{showBadge && <div className={styles.badge}></div>}
		</UiButton>
	);
}
