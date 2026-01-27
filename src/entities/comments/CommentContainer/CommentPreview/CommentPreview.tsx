import React from "react";
import clsx from "clsx";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { Commentator, CommentMessage } from "microboard-temp";
import styles from "./CommentPreview.module.css";
import { useTranslation } from "react-i18next";
import { Avatar } from "features/UserPanel/Avatar/Avatar";
import { formatDate } from "shared/date/lib";
import { getCorrectEnding } from "shared/lib/getCorrectEnding";

interface Props {
  commentators: Commentator[];
  firstMessage: CommentMessage;
  messagesCount: number;
  handleClick: () => void;
  isOpen: boolean;
}

export const CommentPreview = ({
  commentators,
  firstMessage,
  messagesCount,
  handleClick,
  isOpen,
}: Props): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <div
      onClick={handleClick}
      className={styles.preview}
      style={isOpen ? undefined : { display: "none" }}
    >
      <div
        className={clsx(commentators.length > 1 ? styles.wrap : styles.noWrap)}
      >
        {commentators.length === 1 ? (
          <Avatar
            key={commentators[0].username}
            avatar={commentators[0].avatar}
            width={32}
            height={32}
          />
        ) : (
          <div className={styles.avatarsMap}>
            {commentators.slice(0, 5).map((commentator) => {
              return (
                <Avatar
                  key={commentator.id}
                  avatar={commentator.avatar}
                  width={32}
                  height={32}
                />
              );
            })}
          </div>
        )}
        <div>
          <div
            className={clsx(
              styles.noWrap,
              styles.spaceBetween,
              styles.infoContainer,
            )}
          >
            <p className={styles.username}>{commentators[0].username}</p>
            <p className={styles.smallText}>
              {formatDate(new Date(firstMessage.date))}
            </p>
          </div>
          <p className={styles.message}>{firstMessage.text}</p>
        </div>
      </div>
      <Icon
        width={18}
        height={8}
        iconName={"CommentTippy"}
        className={styles.commentTippy}
      />
      {!!messagesCount && (
        <p className={clsx(styles.smallText, styles.fullWidth)}>
          {messagesCount}{" "}
          {t(`comment.answer.${getCorrectEnding(messagesCount)}`)}
        </p>
      )}
    </div>
  );
};
