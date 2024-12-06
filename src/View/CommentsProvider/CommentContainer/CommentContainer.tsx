import React, { useEffect, useRef, useState } from "react";
import { useDomMbr } from "Board/Items/Mbr/useDomMbr";
import { useAppContext } from "View/AppContext";
import { Icon } from "../../Icon";
import styles from "./CommentContainer.module.css";
import { Comment } from "Board/Items/Comment/Comment";
import clsx from "clsx";
import { ThreadPanel } from "../Thread/ThreadPanel";
import { useCommentsContext } from "../CommentsContext.tsx";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import { Point } from "Board/Items/Point/Point";
import { CommentPreview } from "./CommentPreview/CommentPreview";
import { Avatar } from "View/UserPanel/Avatar/Avatar.tsx";
import { useAccount } from "App/useAccount.ts";

interface Props {
	comment: Comment;
}

export const CommentContainer = ({ comment }: Props) => {
	const commentContainerRef = useRef<HTMLDivElement | null>(null);
	const threadPanelRef = useRef<HTMLDivElement | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [initialCommentPosition, setInitialCommentPosition] = useState<Point>(
		comment.getAnchorPoint(),
	);
	const { app, board } = useAppContext();
	const {
		openedThreadId,
		setOpenedThreadId,
		setMovingComment,
		movingComment,
	} = useCommentsContext();
	const isThreadOpen = openedThreadId === comment.getId();
	const account = useAccount();

	const mbr = useDomMbr({
		app,
		board,
		ref: isThreadOpen ? threadPanelRef : commentContainerRef,
		targetMbr: comment.getAnchorMbr(),
		subjects: ["camera", "selectionItem", "items"],
		fit: isThreadOpen ? "threadPanel" : "comment",
	});
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["tools", "items", "selectionItems"],
		observer: () => {
			forceUpdate();
		},
	});

	const commentators = comment.getCommentators();
	const width = 12 + 24 + 18 * (commentators.length - 1);

	useEffect(() => {
		const select = board.tools.getSelect();
		if (
			(isDragging && (!select || !select.isDownOnUnselectedItem)) ||
			isThreadOpen
		) {
			const commentAnchor = comment.getAnchorPoint();
			if (
				commentAnchor.x === initialCommentPosition.x &&
				commentAnchor.y === initialCommentPosition.y
			) {
				setOpenedThreadId(comment.getId());
			}
			setIsDragging(false);
			setMovingComment(null);
		}
	}, [
		isDragging,
		board.tools.getSelect()?.isDownOnUnselectedItem,
		isThreadOpen,
		initialCommentPosition,
	]);

	const togglePreview = () => {
		if (!isDragging) {
			setIsPreviewOpen(!isPreviewOpen);
		}
	};

	const handleMouseUp = () => {
		if (isDragging) {
			setIsDragging(false);
		}
		setOpenedThreadId(comment.getId());
	};

	const handleMouseDown = (e: MouseEvent) => {
		setIsPreviewOpen(false);
		board.selection.removeAll();
		board.isBoardMenuOpen = false;
		if (isThreadOpen || e.button === 2) {
			return;
		}
		const select = board.tools.getSelect();
		if (select) {
			const commentAnchor = comment.getAnchorPoint();
			comment.setItemToFollow(undefined);
			setMovingComment(comment);
			select.leftButtonDown(comment);
			board.pointer.pointTo(commentAnchor.x, commentAnchor.y);
			setInitialCommentPosition(commentAnchor);
			setIsPreviewOpen(false);
			setIsDragging(true);
		}
	};

	const username = account.info?.name || account.info?.email;
	const unreadMessages = comment.getUnreadMessages(username);
	const isUnread = Boolean(
		unreadMessages ||
			(username && comment.getIsThreadMarkedAsUnread(username)),
	);

	const zIndex = isThreadOpen ? 3 : 2;

	return (
		<div
			ref={commentContainerRef}
			style={{
				width: "fit-content",
				height: "fit-content",
				position: "fixed",
				zIndex,
				left: mbr.left,
				top: mbr.top,
				pointerEvents: isDragging || !!movingComment ? "none" : "auto",
			}}
			id={`comment-${comment.getId()}`}
		>
			{isThreadOpen ? (
				<ThreadPanel comment={comment} ref={threadPanelRef} mbr={mbr} />
			) : (
				<div
					onMouseEnter={togglePreview}
					onMouseLeave={togglePreview}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
				>
					<div
						className={clsx(
							styles.comment,
							isUnread && styles.unread,
						)}
						style={{
							width,
						}}
					>
						{!comment.getResolved() ? (
							commentators
								.slice(0, 3)
								.map((commentator, index) => {
									return (
										<Avatar
											avatar={commentator.avatar}
											key={index}
											style={{
												border: "2px solid #ffffff",
												boxSizing: "unset",
												marginLeft:
													index > 0 ? "-6px" : 0,
											}}
										/>
									);
								})
						) : (
							<Icon
								iconName={"checkMark"}
								width={20}
								height={20}
							/>
						)}
						{isPreviewOpen && (
							<CommentPreview
								handleClick={() =>
									setOpenedThreadId(comment.getId())
								}
								commentators={commentators}
								firstMessage={comment.getThread()[0]}
								messagesCount={comment.getThread().length - 1}
							/>
						)}
						{isUnread && (
							<div className={styles.badge}>
								{username &&
								comment.getIsThreadMarkedAsUnread(username) ? (
									<div className={styles.badgeDot}></div>
								) : (
									unreadMessages.length
								)}
							</div>
						)}
						<Icon
							width={18}
							height={8}
							iconName={"CommentTippy"}
							className={styles.commentTippy}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
