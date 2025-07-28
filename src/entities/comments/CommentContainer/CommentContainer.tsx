import React, { TouchEventHandler, useEffect, useRef, useState } from "react";
import { useDomMbr } from "App/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Icon } from "../../../shared/ui-lib/Icon/index";
import styles from "./CommentContainer.module.css";
import clsx from "clsx";
import { ThreadPanel } from "../Thread/ThreadPanel";
import { useCommentsContext } from "../CommentsContext";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { Point, Comment } from "microboard-temp";
import { CommentPreview } from "./CommentPreview/CommentPreview";
import { Avatar } from "features/UserPanel/Avatar/Avatar";
import { useAccount } from "App/useAccount";

interface Props {
  comment: Comment;
}

export const CommentContainer = ({ comment }: Props) => {
  const commentContainerRef = useRef<HTMLDivElement | null>(null);
  const threadPanelRef = useRef<HTMLDivElement | null>(null);
  const commentRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const initialCommentPosition = useRef<Point>(comment.getAnchorPoint());
  const { app, board } = useAppContext();
  const { openedThreadId, setOpenedThreadId, setMovingComment, movingComment } =
    useCommentsContext();
  const movingCommentRef = useRef<Comment | null>(movingComment);
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
    subjects: ["tools", "pointer", "items", "selectionItems", "selection"],
    observer: () => {
      const select = board.tools.getSelect();
      if (movingCommentRef.current && select && !select.isLeftDown) {
        setMovingComment(null);
        movingCommentRef.current = null;
        if (
          initialCommentPosition.current.x === comment.getAnchorPoint().x &&
          initialCommentPosition.current.y === comment.getAnchorPoint().y
        ) {
          return setOpenedThreadId(comment.getId());
        }
      }
      forceUpdate();
    },
  });

  const commentators = comment.getCommentators();
  const width =
    12 + 24 + 18 * (commentators.length > 3 ? 2 : commentators.length - 1);

  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.addEventListener("wheel", app.controller.onWheel, {
        capture: true,
        passive: false,
      });
    }

    return () => {
      if (commentRef.current) {
        commentRef.current.removeEventListener("wheel", app.controller.onWheel);
      }
    };
  }, [isThreadOpen]);

  const openPreview = () => {
    if (!movingComment) {
      setIsPreviewOpen(true);
    }
  };

  const closePreview = () => {
    if (!movingComment) {
      setIsPreviewOpen(false);
    }
  };

  const handleMouseUp = () => {
    setOpenedThreadId(comment.getId());
  };

  const handleMouseDown = (
    e: MouseEvent | TouchEventHandler<HTMLDivElement>,
  ) => {
    if ("touches" in e) {
      return;
    }

    setIsPreviewOpen(false);
    board.selection.removeAll();

    if (isThreadOpen || (e as MouseEvent).button === 2) {
      return;
    }
    const select = board.tools.getSelect();
    if (select) {
      const commentAnchor = comment.getAnchorPoint();
      comment.setItemToFollow(undefined);
      setMovingComment(comment);
      movingCommentRef.current = comment;
      select.leftButtonDown(comment);
      initialCommentPosition.current = commentAnchor;
      setIsPreviewOpen(false);
      board.pointer.pointTo(commentAnchor.x, commentAnchor.y);
    }
  };

  const userId = account.info?.id;
  const unreadMessages = comment.getUnreadMessages(userId);
  const isUnread = Boolean(
    unreadMessages || (userId && comment.getIsThreadMarkedAsUnread(userId)),
  );

  const zIndex = isThreadOpen ? 3 : isPreviewOpen ? 2 : 1;

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
        pointerEvents: movingComment ? "none" : "auto",
      }}
      id={`comment-${comment.getId()}`}
    >
      {isThreadOpen ? (
        <ThreadPanel comment={comment} ref={threadPanelRef} mbr={mbr} />
      ) : (
        <div
          ref={commentRef}
          onMouseEnter={openPreview}
          onMouseLeave={closePreview}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <div
            className={clsx(styles.comment, isUnread && styles.unread)}
            style={{
              width,
            }}
          >
            {!comment.getResolved() ? (
              commentators.slice(0, 3).map((commentator, index) => {
                return (
                  <Avatar
                    avatar={commentator.avatar}
                    key={index}
                    style={{
                      border: "2px solid #ffffff",
                      boxSizing: "unset",
                      marginLeft: index > 0 ? "-6px" : 0,
                    }}
                  />
                );
              })
            ) : (
              <Icon iconName={"checkMark"} width={20} height={20} />
            )}
            <CommentPreview
              isOpen={isPreviewOpen}
              handleClick={() => setOpenedThreadId(comment.getId())}
              commentators={commentators}
              firstMessage={comment.getThread()[0]}
              messagesCount={comment.getThread().length - 1}
            />
            {isUnread && (
              <div className={styles.badge}>
                {userId && comment.getIsThreadMarkedAsUnread(userId) ? (
                  <div className={styles.badgeDot}></div>
                ) : (
                  unreadMessages?.length
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
