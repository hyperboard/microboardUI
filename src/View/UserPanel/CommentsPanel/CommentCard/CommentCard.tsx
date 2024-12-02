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

interface Props {
	comment: Comment;
}

export const CommentCard = ({ comment }: Props) => {
	const [showMoreComments, setShowMoreComments] = useState(false);
	const refs = useRef<Record<string, HTMLDivElement>>({});
	const { board, app } = useAppContext();
	const account = useAccount();
	const { t } = useTranslation();
	const { setOpenedThreadId } = useCommentsContext();

	const username = account.info?.name || account.info?.email;
	const messages = comment.getThread();
	const unreadMessages = comment
		.getUnreadMessages(username)
		?.filter(message => message.id !== messages[0].id);

	useIntersectionObserver({
		comment,
		refs,
		username: app.account.info?.email,
		deps: [showMoreComments],
		disabled: !showMoreComments,
	});

	const handleCardClick = () => {
		const item = board.items.getById(comment.getId());
		if (!item) {
			return;
		}

		board.camera.zoomToFit(item.getMbr());
	};

	const handleBtnClick = (e: MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		setShowMoreComments(!showMoreComments);
	};

	const setRef = (id: string) => (el: HTMLDivElement) => {
		refs.current[id] = el;
	};

	const handleMessageClick = () => {
		setOpenedThreadId(comment.getId());
	};

	let showMoreText: string;
	if (unreadMessages) {
		const ending = getCorrectEnding(unreadMessages.length);
		showMoreText = `${t("comment.panel.card.showNew", { count: unreadMessages.length })} 
		${t("comment.panel.card.new." + ending)}
		${t("comment.panel.card.comments." + ending)}`;
	} else {
		showMoreText = `${t("comment.panel.card.showMore", { count: messages.length - 1 })} 
        ${t("comment.panel.card.comments." + getCorrectEnding(messages.length - 1))}`;
	}

	return (
		<div className={styles.card} onClick={handleCardClick}>
			<div className={clsx(styles.firstMessage)}>
				<Message
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
						onClick={handleBtnClick}
					>
						{!showMoreComments
							? showMoreText
							: t("comment.panel.card.hideComments")}
					</button>
				)}
			</div>
			{showMoreComments &&
				messages.slice(1).map(mes => {
					return (
						<Message
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
