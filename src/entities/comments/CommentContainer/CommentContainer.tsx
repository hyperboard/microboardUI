import React, { useEffect, useRef, useState } from "react";
import { useDomMbr } from "App/useDomMbr";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./CommentContainer.module.css";
import clsx from "clsx";
import { ThreadPanel } from "../Thread/ThreadPanel";
import { useCommentsContext } from "entities/comments";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { Point, Comment } from "microboard-temp";
import { CommentPreview } from "./CommentPreview/CommentPreview";
import { Avatar } from "features/UserPanel/Avatar/Avatar";
import { useAccount } from "App/useAccount";

interface Props {
  comment: Comment;
}

const AVATARS_OFFSET = 18;
// Touch jitter can move the comment by a few board units even on a tap,
// so use a threshold instead of strict equality to detect "no movement".
const CLICK_THRESHOLD = 10;
// Dead zone in screen pixels before we start forwarding touch pointermove to
// the controller. Prevents jitter from being treated as intentional drag.
const DRAG_THRESHOLD_PX = 8;

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
  const lastTouchStartRef = useRef(0);
  const touchStartScreenPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
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
        const anchor = comment.getAnchorPoint();
        if (
          Math.abs(initialCommentPosition.current.x - anchor.x) <
            CLICK_THRESHOLD &&
          Math.abs(initialCommentPosition.current.y - anchor.y) <
            CLICK_THRESHOLD
        ) {
          return setOpenedThreadId(comment.getId());
        }
      }
      forceUpdate();
    },
  });

  const commentators = comment.getCommentators();
  const width =
    36 +
    AVATARS_OFFSET * (commentators.length > 3 ? 2 : commentators.length - 1);

  useEffect(() => {
    const el = commentRef.current;
    if (!el) return;

    el.addEventListener("wheel", app.controller.onWheel, {
      capture: true,
      passive: false,
    });

    // On mobile, touchstart establishes implicit pointer capture on the comment
    // element, so all subsequent pointermove events target the comment instead
    // of the canvas. The canvas's onPointerMove never fires, and the comment
    // won't follow the finger. Forward touch pointermove to the controller,
    // but only after the finger has moved past DRAG_THRESHOLD_PX to avoid
    // forwarding natural jitter during a tap (which would shift the comment
    // slightly and make the "no movement" check fail).
    const forwardPointerMove = (e: PointerEvent) => {
      if (movingCommentRef.current && e.pointerType !== "mouse") {
        if (!isDraggingRef.current) {
          const start = touchStartScreenPosRef.current;
          if (!start) return;
          if (
            Math.abs(e.clientX - start.x) <= DRAG_THRESHOLD_PX &&
            Math.abs(e.clientY - start.y) <= DRAG_THRESHOLD_PX
          ) {
            return;
          }
          isDraggingRef.current = true;
        }
        app.controller.onPointerMove(e);
      }
    };
    el.addEventListener("pointermove", forwardPointerMove);

    // Without preventDefault on touchmove, the browser decides after ~300-500ms
    // that the gesture is a scroll, takes over, and stops delivering events.
    // This keeps drag working for the full duration of the touch.
    const blockScrollDuringDrag = (e: TouchEvent) => {
      if (movingCommentRef.current) {
        e.preventDefault();
      }
    };
    el.addEventListener("touchmove", blockScrollDuringDrag, { passive: false });

    return () => {
      el.removeEventListener("wheel", app.controller.onWheel);
      el.removeEventListener("pointermove", forwardPointerMove);
      el.removeEventListener("touchmove", blockScrollDuringDrag);
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
    const currentPosition = comment.getAnchorPoint();
    const didNotMove =
      Math.abs(initialCommentPosition.current.x - currentPosition.x) <
        CLICK_THRESHOLD &&
      Math.abs(initialCommentPosition.current.y - currentPosition.y) <
        CLICK_THRESHOLD;
    if (didNotMove) {
      setOpenedThreadId(comment.getId());
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) => {
    if ("touches" in e) {
      // Record the time so we can detect the synthetic mousedown that browsers
      // fire after touchend (only on taps) and skip it to avoid restarting drag.
      lastTouchStartRef.current = Date.now();
      const touch = e.touches[0];
      touchStartScreenPosRef.current = { x: touch.clientX, y: touch.clientY };
      isDraggingRef.current = false;
    } else if (Date.now() - lastTouchStartRef.current < 500) {
      // Synthetic mousedown fired shortly after touchstart — skip.
      return;
    }

    setIsPreviewOpen(false);
    board.selection.removeAll();

    if (isThreadOpen || ("button" in e && e.button === 2)) {
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

      // CommentsProvider is rendered outside the canvas stage DOM tree, so the
      // canvas's capture-phase pointerup listener never fires for comment clicks.
      // Without it, tools.leftButtonUp() is never called, isLeftDown stays true
      // forever, and the comment never unsticks. This listener closes that gap.
      window.addEventListener(
        "pointerup",
        () => {
          if (movingCommentRef.current) {
            board.tools.leftButtonUp();
          }
        },
        { once: true },
      );
    }
  };

  const userId = account.info?.id;
  const unreadMessages = comment.getUnreadMessages(userId);
  const isUnread = Boolean(
    unreadMessages || (userId && comment.getIsThreadMarkedAsUnread(userId)),
  );

  // Thread must sit above the side panel (z-index: 100).
  const zIndex = isThreadOpen ? 101 : isPreviewOpen ? 2 : 1;
  // On mobile, center the thread panel on the screen instead of anchoring it
  // to the comment's board position (which may be off-screen or awkward).
  const isMobile = window.innerWidth <= 640;
  const threadStyle =
    isThreadOpen && isMobile
      ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
      : { left: mbr.left, top: mbr.top, transform: undefined };

  return (
    <div
      ref={commentContainerRef}
      style={{
        width: "fit-content",
        height: "fit-content",
        position: "fixed",
        zIndex,
        ...threadStyle,
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
