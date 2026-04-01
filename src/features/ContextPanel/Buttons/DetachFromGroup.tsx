import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { type BaseItem } from "microboard-temp";
import btnStyle from "./ContextPanelButton.module.css";

type Props = {
  rounded?: "left" | "right" | "none" | "full";
};

export function DetachFromGroup({
  rounded = "none",
}: Props): React.ReactElement | null {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const selectedItems = board.selection.list();

  // Show only when exactly one item is selected and it lives inside a group
  if (selectedItems.length !== 1) {
    return null;
  }
  const item = selectedItems[0] as BaseItem;
  if (item.parent === "Board") {
    return null;
  }
  const parentGroup = board.items.getById(item.parent);
  if (!parentGroup || parentGroup.itemType !== "Group") {
    return null;
  }

  const handleDetach = (): void => {
    board.detachFromGroup(item);
    board.selection.removeAll();
    board.selection.add(item);
    board.tools.publish();
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"detachFromGroup"}
      onClick={handleDetach}
      variant="secondary"
      rounded={rounded}
      tooltip={t("contextPanel.detachFromGroup.tooltip", "Detach from group")}
      tooltipPosition="top"
    >
      <Icon iconName="ArrowUp" />
    </UiButton>
  );
}
