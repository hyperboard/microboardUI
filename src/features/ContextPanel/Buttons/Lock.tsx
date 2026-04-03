import { Group } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  rounded?: "none" | "left";
};

export const Lock = ({
  rounded = "none",
}: Props): React.ReactElement | null => {
  const { t } = useTranslation();
  const { board } = useAppContext();
  const selectedItems = board.selection.list();

  if (selectedItems.length === 0) return null;

  let isLocked = false;
  if (selectedItems.length > 1) {
    isLocked = !selectedItems.some((item) => !item.transformation.isLocked);
  } else if (selectedItems.length === 1) {
    isLocked = selectedItems[0].transformation.isLocked;
  }

  const handleClick = useCallback(() => {
    if (isLocked) {
      // Unlocking
      if (selectedItems.length === 1 && selectedItems[0] instanceof Group) {
        const group = selectedItems[0] as Group;
        if (group.isLockedGroup) {
          // Dissolve auto-created group
          board.events?.emit({
            class: "Board",
            method: "removeLockedGroup",
            item: [group.getId()],
          });
          return;
        }
      }

      selectedItems.forEach((item) => {
        item.transformation.setIsLocked(false);
      });
    } else {
      const itemsToLock = selectedItems.filter(
        (item) => !item.transformation.isLocked,
      );
      itemsToLock.forEach((item) => {
        item.transformation.setIsLocked(true);
      });
    }
  }, [board, isLocked, selectedItems]);

  const tooltip = isLocked
    ? t("contextPanel.unlock.tooltip")
    : t("contextPanel.lock.tooltip");

  const icon = isLocked ? <Icon iconName="lock" /> : <Icon iconName="unlock" />;

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"lock"}
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      tooltip={tooltip}
      tooltipPosition="top"
    >
      {icon}
    </UiButton>
  );
};
