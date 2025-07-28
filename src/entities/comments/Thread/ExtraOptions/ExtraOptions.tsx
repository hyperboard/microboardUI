import { useAccount } from "App/useAccount";
import { Comment } from "microboard-temp";
import React, { useState } from "react";
import { useAppContext } from "features/AppContext";
import { Icon } from "../../../../shared/ui-lib/Icon";
import styles from "./ExtraOptions.module.css";
import { notify } from "shared/ui-lib/Toast/notify";
import { useTranslation } from "react-i18next";
import { getLinkToItem } from "features/ContextPanel/Buttons/RestOptionsMenu/Items/getLinkToItem";
import { UiButton } from "shared/ui-lib/UiButton";
import { UiPanel } from "shared/ui-lib/UiPanel";

interface Props {
  comment: Comment;
  canEdit: boolean;
}

export const ExtraOptions = ({
  comment,
  canEdit,
}: Props): React.JSX.Element => {
  const [isCursorOnButton, setIsCursorOnButton] = useState(false);
  const [isCursorOnMenu, setIsCursorOnMenu] = useState(false);
  const { board } = useAppContext();
  const account = useAccount();
  const { t } = useTranslation();

  const userId = account.info?.id;

  const handleRemove = (): void => {
    board.remove(comment);
  };

  const handleMarkAsUnread = (): void => {
    if (!userId) {
      return;
    }
    comment.markThreadAsUnread(userId);
  };

  const handleMouseLeave = (element: "menu" | "btn"): void => {
    if (element === "btn") {
      setIsCursorOnButton(false);
    }
    if (element === "menu") {
      setIsCursorOnMenu(false);
    }
  };

  const handleCopyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(getLinkToItem(comment.getId()));
      notify({
        body: t("contextPanel.copyItemLink.success.description"),
        variant: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      notify({
        header: t("contextPanel.copyItemLink.error.title"),
        body: t("contextPanel.copyItemLink.error.description"),
        variant: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      <UiButton
        size="sm"
        variant="secondary"
        onMouseEnter={() => setIsCursorOnButton(true)}
        onMouseLeave={() => handleMouseLeave("btn")}
        style={{
          padding: 0,
          color: "#696B76",
        }}
      >
        <Icon iconName="Dots" width={24} height={24} />
      </UiButton>
      {(isCursorOnButton || isCursorOnMenu) && (
        <div
          className={styles.panelContainer}
          onMouseEnter={() => setIsCursorOnMenu(true)}
          onMouseLeave={() => handleMouseLeave("menu")}
        >
          <UiPanel className={styles.panel} vertical={true}>
            {userId && !comment.getIsThreadMarkedAsUnread(userId) && (
              <button className={styles.btn} onClick={handleMarkAsUnread}>
                <Icon iconName={"MarkAsUnreadComment"} width={20} height={20} />
                {t("comment.markAsUnread")}
              </button>
            )}
            <button onClick={handleCopyLink} className={styles.btn}>
              <Icon iconName={"CopyLink"} width={20} height={20} />
              {t("comment.copyLink")}
            </button>
            {canEdit && (
              <button className={styles.btn} onClick={handleRemove}>
                <Icon
                  style={{ color: "#696B76" }}
                  iconName={"Delete"}
                  width={20}
                  height={20}
                />
                {t("comment.deleteThread")}
              </button>
            )}
          </UiPanel>
        </div>
      )}
    </div>
  );
};
