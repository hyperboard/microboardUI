import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

type Props = {
  rounded?: "none" | "left";
};

export const LockResize = ({
  rounded = "none",
}: Props): React.ReactElement | null => {
  const { t } = useTranslation();
  const { board } = useAppContext();
  const selectedItems = board.selection.list();
  const lockedItems = selectedItems.filter((item) => !item.resizeEnabled);

  const handleClick = (): void => {
    if (lockedItems.length) {
      lockedItems[0].enableResize(lockedItems);
    } else {
      selectedItems[0].disableResize(selectedItems);
    }
  };

  const tooltip = lockedItems.length
    ? t("contextPanel.unlockResize.tooltip")
    : t("contextPanel.lockResize.tooltip");

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"lock-resize"}
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      tooltip={tooltip}
      tooltipPosition="top"
    >
      <Icon
        iconName={lockedItems.length ? "LockFrameUnlocked" : "LockFrameLocked"}
      />
    </UiButton>
  );
};
