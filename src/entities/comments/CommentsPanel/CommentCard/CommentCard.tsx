import React, { MouseEvent, useRef, useState } from "react";
import { Comment } from "microboard-temp";
import styles from "./CommentCard.module.css";
import { Message } from "./Message/Message";
import { useAppContext } from "features/AppContext";
import clsx from "clsx";
import { useAccount } from "App/useAccount";
import { useTranslation } from "react-i18next";
import { useIntersectionObserver } from "entities/comments/useIntersectionObserver";
import { useCommentsContext } from "entities/comments";
import { useScrollToUnreadMessage } from "entities/comments/useScrollToUnreadMessage";
import { getCorrectEnding } from "shared/lib/getCorrectEnding";

interface Props {
  comment: Comment;
}

export const CommentCard = ({ comment }: Props): React.JSX.Element => {
  const [showMoreComments, setShowMoreComments] = useState(false);
  const refs = useRef<Record<string, HTMLDivElement>>({});
  const { board } = useAppContext();
  const account = useAccount();
  const { t } = useTranslation();
  const { setOpenedThreadId } = useCommentsContext();
  const userId = account.info?.id;
  const messages = comment.getThread();
  const unreadMessages = comment.getUnreadMessages(userId);

  useIntersectionObserver({
    comment,
    refs,
    userId,
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
            !!unreadMessages.find((message) => message.id === messages[0].id) &&
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
            className={clsx(styles.btn, unreadMessages && styles.highlighted)}
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
                !!unreadMessages.find((message) => message.id === mes.id)
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
