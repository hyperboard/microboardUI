import { useBoardsList } from "App/useBoardsList";
import React, { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { useContextMenuContext } from "features/ContextMenu";
import { Icon } from "shared/ui-lib/Icon";
import { SHARE_MODAL_ID } from "features/ShareModal/ShareModal";
import commonStyles from "../../UserPanel.module.css";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { isIframe } from "shared/lib/isIframe";
import { redirectParentPage } from "shared/lib/IframeModule";

export const ShareBtn: React.FC = () => {
  const { setIds } = useContextMenuContext();
  const { openModal } = useUiModalContext();
  const { board } = useAppContext();
  const { t } = useTranslation();
  const boardsList = useBoardsList();

  const boardId = board.getBoardId();
  const boardInfo = boardsList.getBoardInfo(boardId);

  const handleShare: MouseEventHandler = (ev) => {
    if (isIframe()) {
      const currentPage = window.location.href;
      redirectParentPage(
        currentPage,
        currentPage.includes("dev")
          ? "https://dev-landing.microboard.io/"
          : "https://microboard.io/",
      );
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    setIds(boardId);
    board.selection.setContext("None");
    openModal(SHARE_MODAL_ID);
  };

  if (board.getBoardId() === "blank") {
    return null;
  }

  return (
    <UiButton
      onClick={handleShare}
      variant="primary"
      className={commonStyles.shareButton}
      size="sm"
    >
      <Icon
        width={16}
        height={16}
        iconName={boardInfo?.isPublic ? "publicDrafts" : "lock"}
      />
      {t("sharing.share")}
    </UiButton>
  );
};
