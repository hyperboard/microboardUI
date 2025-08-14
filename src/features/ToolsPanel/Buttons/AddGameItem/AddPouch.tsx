import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/index";

export function AddPouch() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = () => {
    board.tools.addRegisteredTool("AddPouch", true);
  };

  const isActive = Boolean(board.tools.getAddRegisteredTool("AddPouch"));

  return (
    <UiButton
      id={"tool-add-pouch"}
      tooltip={t("toolsPanel.addGameItem.addPouch.tooltip")}
      onClick={handleClick}
      variant="secondary"
      rounded="none"
      active={isActive}
    >
      <Icon iconName="AddPouch" width={24} height={24} />
    </UiButton>
  );
}
