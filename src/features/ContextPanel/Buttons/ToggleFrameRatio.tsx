import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

export function ToggleFrameRatio(): React.ReactElement | null {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const canChange = board.selection.getCanChangeRatio();

  const handleClick = (): void => {
    board.selection.setCanChangeRatio(!canChange);
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"switch-pointers"}
      onClick={handleClick}
      variant="secondary"
      rounded="none"
      active={!canChange}
      tooltip={
        canChange
          ? t("contextPanel.lockFrameRatio.tooltip.lock")
          : t("contextPanel.lockFrameRatio.tooltip.unlock")
      }
      tooltipPosition="top"
    >
      <Icon iconName={canChange ? "LockFrameUnlocked" : "LockFrameLocked"} />
    </UiButton>
  );
}
