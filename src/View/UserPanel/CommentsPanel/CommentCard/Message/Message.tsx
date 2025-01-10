import React, { ForwardedRef, forwardRef } from "react";
import clsx from "clsx";
import { formatDate } from "utils";
import { Message as IMessage } from "Board/Items/Comment/Comment";
import styles from "./Message.module.css";
import { useCommentsContext } from "View/CommentsProvider";
import { Avatar } from "View/UserPanel/Avatar/Avatar";

interface Props {
	message: IMessage;
	clipText?: boolean;
	handleClick?: () => void;
	isFirstMessage?: boolean;
	isUnread: boolean;
}

export const Message = forwardRef(
	(
		{
			message,
			handleClick,
			clipText = false,
			isFirstMessage,
			isUnread,
		}: Props,
		ref: ForwardedRef<HTMLDivElement>,
	) => {
		const { setTargetMessageId } = useCommentsContext();

		const commentator = message.commentator;

		const onClick = (): void => {
			if (handleClick) {
				handleClick();
				setTargetMessageId(message.id);
			}
		};

		return (
			<div
				onClick={onClick}
				ref={ref}
				className={clsx(
					isFirstMessage ? styles.firstMessage : styles.message,
					isUnread && styles.unread,
				)}
			>
				<Avatar avatar={commentator.avatar} width={32} height={32} />
				<div className={styles.fullWidth}>
					<div className={styles.messageInfo}>
						<p className={styles.username}>
							{commentator.username}
						</p>
						<p className={clsx(styles.smallText, styles.date)}>
							{formatDate(new Date(message.date))}
						</p>
					</div>
					<p
						className={clsx(
							styles.smallText,
							clipText && styles.clipText,
						)}
					>
						{message.text}
					</p>
				</div>
			</div>
		);
	},
);

Message.displayName = "Message";
