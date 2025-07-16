import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

export function SwitchPointers(): React.ReactElement | null {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const handleClick = (): void => {
    board.selection.switchPointers();
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={"switch-pointers"}
      tooltip={t("contextPanel.connectorSwitchPointers.tooltip")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded="none"
    >
      <Icon iconName="Switch" />
    </UiButton>
  );
}
