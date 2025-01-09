import React, { MouseEvent, useRef, useState } from "react";
import { Comment } from "Board/Items/Comment/Comment";
import styles from "./CommentCard.module.css";
import { Message } from "./Message/Message";
import { useAppContext } from "View/AppContext";
import clsx from "clsx";
import { useAccount } from "App/useAccount";
import { useTranslation } from "react-i18next";
import { getCorrectEnding } from "utils";
import { useIntersectionObserver } from "View/CommentsProvider/useIntersectionObserver";
import { useCommentsContext } from "View/CommentsProvider";
import { useScrollToUnreadMessage } from "View/CommentsProvider/useScrollToUnreadMessage";

interface Props {
	comment: Comment;
}

export const CommentCard = ({ comment }: Props): JSX.Element => {
	const [showMoreComments, setShowMoreComments] = useState(false);
	const refs = useRef<Record<string, HTMLDivElement>>({});
	const { board } = useAppContext();
	const account = useAccount();
	const { t } = useTranslation();
	const { setOpenedThreadId } = useCommentsContext();
	const username = account.info?.name || account.info?.email;
	const messages = comment.getThread();
	const unreadMessages = comment.getUnreadMessages(username);

	useIntersectionObserver({
		comment,
		refs,
		username: account.info?.name || account.info?.email,
		deps: [showMoreComments, unreadMessages && unreadMessages.length],
		disabled: !showMoreComments,
	});
	useScrollToUnreadMessage({
		unreadMessages,
		refs,
		deps: [showMoreComments],
	});

	const handleCardClick = (): void => {
		const item = board.items.getById(comment.getId());
		if (!item) {
			return;
		}

		board.camera.zoomToFit(item.getMbr());
	};

	const handleShowBtnClick = (ev: MouseEvent<HTMLButtonElement>): void => {
		ev.stopPropagation();
		setShowMoreComments(!showMoreComments);
	};

	const setRef = (id: string) => (el: HTMLDivElement) => {
		refs.current[id] = el;
	};

	const handleMessageClick = (): void => {
		setOpenedThreadId(comment.getId());
	};

	let showMoreText: string;
	if (unreadMessages) {
		const ending = getCorrectEnding(unreadMessages.length);
		showMoreText = `${t("comment.panel.card.showNew", { count: unreadMessages.length })} 
		${t(`comment.panel.card.new.${ending}`)}
		${t(`comment.panel.card.comments.${ending}`)}`;
	} else {
		showMoreText = `${t("comment.panel.card.showMore", { count: messages.length - 1 })} 
        ${t(`comment.panel.card.comments.${getCorrectEnding(messages.length - 1)}`)}`;
	}

	return (
		<div className={styles.card} onClick={handleCardClick}>
			<div
				className={clsx(
					styles.firstMessage,
					!!unreadMessages &&
						!!unreadMessages.find(
							message => message.id === messages[0].id,
						) &&
						styles.unread,
				)}
			>
				<Message
					isUnread={false}
					isFirstMessage
					ref={setRef(messages[0].id)}
					message={messages[0]}
					clipText={!showMoreComments && messages.length > 1}
				/>
				{messages.length > 1 && (
					<button
						className={clsx(
							styles.btn,
							unreadMessages && styles.highlighted,
						)}
						onClick={handleShowBtnClick}
					>
						{!showMoreComments
							? showMoreText
							: t("comment.panel.card.hideComments")}
					</button>
				)}
			</div>
			{showMoreComments &&
				messages.length &&
				messages.slice(1).map((mes) => {
					if (!mes || !mes.id) {
						return null;
					}
					return (
						<Message
							isUnread={
								!!unreadMessages &&
								!!unreadMessages.length &&
								!!unreadMessages.find(
									message => message.id === mes.id,
								)
							}
							handleClick={handleMessageClick}
							ref={setRef(mes.id)}
							key={mes.id}
							message={mes}
						/>
					);
				})}
		</div>
	);
};
