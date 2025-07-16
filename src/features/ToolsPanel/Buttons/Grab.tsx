import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function Grab() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = () => {
    board.tools.navigate();
  };

  const isActive = Boolean(board.tools.getNavigate());

  return (
    <UiButton
      id={"tool-select"}
      tooltip={isActive ? undefined : t("toolsPanel.grab.tooltip")}
      onClick={handleClick}
      active={isActive}
      variant="secondary"
      rounded="top"
    >
      <Icon iconName="Hand" />
    </UiButton>
  );
}
