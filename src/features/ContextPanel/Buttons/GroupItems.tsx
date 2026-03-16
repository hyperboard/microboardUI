import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { Group } from "microboard-temp";
import { BaseItem } from "microboard-temp/dist/types/Items/BaseItem";

type Props = {
  rounded?: "left" | "right" | "none" | "full";
};

export function GroupItems({
  rounded = "none",
}: Props): React.ReactElement | null {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const selectedItems = board.selection.list();
  const isGroup =
    selectedItems.length === 1 && selectedItems[0] instanceof Group;

  const handleGroup = (): void => {
    const group = board.groupItems(selectedItems as BaseItem[]);
    if (group) {
      board.selection.removeAll();
      board.selection.add(group);
    } else {
      board.selection.setContext("None");
    }
  };

  const handleUngroup = (): void => {
    const group = selectedItems[0] as Group;
    board.ungroupItems(group);
    board.selection.setContext("None");
  };

  if (isGroup) {
    return (
      <UiButton
        className={btnStyle.contextPanelButton}
        id={"ungroup"}
        onClick={handleUngroup}
        variant="secondary"
        rounded={rounded}
        tooltip={t("contextPanel.ungroup.tooltip", "Ungroup")}
        tooltipPosition="top"
      >
        <Icon iconName="Ungroup" />
      </UiButton>
    );
  }

  if (selectedItems.length < 2) {
    return null;
  }

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"group"}
      onClick={handleGroup}
      variant="secondary"
      rounded={rounded}
      tooltip={t("contextPanel.group.tooltip", "Group")}
      tooltipPosition="top"
    >
      <Icon iconName="Group" />
    </UiButton>
  );
}
