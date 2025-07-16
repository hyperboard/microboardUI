import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";

export function ToggleIsShining() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();

  if (!single || single.itemType !== "Star") {
    return null;
  }

  const handleClick = (): void => {
    single.toggleIsShining();
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="ChangeTextColor"
      tooltip={t("contextPanel.textColor.tooltip")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      active={single.isShining}
      rounded="none"
    >
      <Icon iconName="Plus" />
    </UiButton>
  );
}
