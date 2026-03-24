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
  const starItem = single as unknown as
    | ({
        toggleIsShining?: () => void;
        isShining?: boolean;
      } & typeof single)
    | null;

  if (
    !starItem ||
    starItem.itemType !== "Star" ||
    typeof starItem.toggleIsShining !== "function" ||
    typeof starItem.isShining !== "boolean"
  ) {
    return null;
  }

  const toggleIsShining = starItem.toggleIsShining;

  const handleClick = (): void => {
    toggleIsShining();
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="ChangeTextColor"
      tooltip={t("contextPanel.textColor.tooltip")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      active={starItem.isShining}
      rounded="none"
    >
      <Icon iconName="Plus" />
    </UiButton>
  );
}
