import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/index";

export function AddScreen() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = () => {
    board.tools.addRegisteredTool("AddScreen", true);
  };

  const isActive = Boolean(board.tools.getAddRegisteredTool("AddScreen"));

  return (
    <UiButton
      id={"redo"}
      tooltip={t("toolsPanel.addGameItem.addScreen.tooltip")}
      onClick={handleClick}
      variant="secondary"
      rounded="none"
      active={isActive}
    >
      <Icon iconName="AddScreen" />
    </UiButton>
  );
}
