import { getHotkeyLabel } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function AddText() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = () => {
    board.tools.addText(true);
  };

  const isActive = Boolean(board.tools.getAddText());

  return (
    <UiButton
      id={"tool-add-text"}
      tooltip={isActive ? undefined : t("toolsPanel.addText.tooltip")}
      hotkey={getHotkeyLabel("text")}
      onClick={handleClick}
      active={isActive}
      variant="secondary"
      rounded="none"
    >
      <Icon iconName="Text" />
    </UiButton>
  );
}
