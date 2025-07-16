import React from "react";
import styles from "../BoardMenu.module.css";
import { useCommentsContext } from "entities/comments/CommentsContext";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { Icon } from "shared/ui-lib/Icon/Icon";

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
    board.items.getComments().forEach((comment) => {
      if (!comment.getResolved()) {
        comment.setResolved(true);
      }
    });
  };

  return (
    <>
      <button onClick={toggleShowResolved} className={styles.btn}>
        <div className={styles.buttonContainer}>
          <Icon
            iconName={showResolved ? "EyeCrossed" : "EyeOpen"}
            width={20}
            height={20}
          />
          {showResolved
            ? t("boardMenu.comments.hideResolved")
            : t("boardMenu.comments.showResolved")}
        </div>
      </button>
      {isOwner && (
        <button onClick={resolveAllComments} className={styles.btn}>
          <div className={styles.buttonContainer}>
            <Icon
              iconName="Comment"
              width={18}
              height={18}
              style={{ color: "rgba(105, 107, 118, 1)" }}
            />
            {t("boardMenu.comments.resolveAll")}
          </div>
        </button>
      )}
    </>
  );
};
