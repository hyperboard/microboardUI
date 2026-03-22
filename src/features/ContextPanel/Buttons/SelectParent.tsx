import { useAppContext } from "features/AppContext";
import { getSelectParentHotkeyLabel } from "features/HierarchyNavigation/hotkeys";
import { selectParentInHierarchy } from "features/HierarchyNavigation/hierarchyUi";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import btnStyle from "./ContextPanelButton.module.css";

type Props = {
  rounded?: "left" | "right" | "none" | "full";
};

export function SelectParent({
  rounded = "none",
}: Props): React.ReactElement | null {
  const { board } = useAppContext();
  const { t } = useTranslation();

  if (!board.selection.canPromoteSelectionToParent()) {
    return null;
  }

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"selectParent"}
      aria-label={t("contextPanel.selectParent.tooltip")}
      onClick={() => {
        selectParentInHierarchy(board);
      }}
      variant="secondary"
      rounded={rounded}
      tooltip={t("contextPanel.selectParent.tooltip")}
      tooltipPosition="top"
      hotkey={getSelectParentHotkeyLabel()}
    >
      <Icon iconName="ArrowUp" />
    </UiButton>
  );
}
