import React from "react";
import { Button } from "shared/ui-lib/Button/Button";
import styles from "../BoardMenu.module.css";
import { useCommentsContext } from "entities/comments/CommentsContext";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";

export const Comments = () => {
	const { setShowResolved, showResolved } = useCommentsContext();
	const { t } = useTranslation();
	const { board } = useAppContext();
	const account = useAccount();
	const isOwner = account.permissions.checkPermissions(
		"owns",
		"boards",
		board.getBoardId(),
	);

	const toggleShowResolved = () => {
		setShowResolved(!showResolved);
		board.setIsBoardMenuOpen(false);
	};

	const resolveAllComments = () => {
		if (!isOwner) {
			return;
		}
		board.items.getComments().forEach(comment => {
			if (!comment.getResolved()) {
				comment.setResolved(true);
			}
		});
	};

	return (
		<>
			<Button
				onClick={toggleShowResolved}
				className={styles.btn}
				pattern="tertiary"
			>
				{showResolved
					? t("boardMenu.comments.hideResolved")
					: t("boardMenu.comments.showResolved")}
			</Button>
			{isOwner && (
				<Button
					onClick={resolveAllComments}
					className={styles.btn}
					pattern="tertiary"
				>
					{t("boardMenu.comments.resolveAll")}
				</Button>
			)}
		</>
	);
};
