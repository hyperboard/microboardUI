import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "shared/ui-lib/Icon";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { LINK_MODAL } from "features/Modal/SetLinkToModal";

export function SetLinkTo(): React.ReactElement {
  const { toggleMenu } = usePanelContext();
  const { t } = useTranslation();
  const { openModal, setModalData } = useUiModalContext();
  const { board } = useAppContext();
  const hasLink = board.selection.items.getSingle()?.getLinkTo();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (
    event,
  ): void => {
    event.stopPropagation();
    board.selection.setContext("EditUnderPointer");
    setModalData(board.selection.items.getSingle()?.getLinkTo());
    openModal(LINK_MODAL);
    toggleMenu("None");
  };

  return (
    <RestOptionsMenuItem
      onClick={handleClick}
      icon={<Icon width={20} height={20} iconName="addLink" />}
    >
      {t(`contextPanel.setLinkTo.${hasLink ? "edit" : "add"}`)}
    </RestOptionsMenuItem>
  );
}
