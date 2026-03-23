import { Connector } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

export function ConnectorSmartJump(): React.ReactElement | null {
  const { t } = useTranslation();
  const { board } = useAppContext();
  const selectedItems = board.selection.list();

  const connectors = selectedItems.filter(
    (item) => item instanceof Connector,
  ) as Connector[];

  if (connectors.length === 0) return null;

  const isActive = connectors.every((c) => c.getSmartJump());

  const handleClick = useCallback(() => {
    connectors.forEach((c) => c.setSmartJump(!isActive));
  }, [connectors, isActive]);

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="connector-smart-jump"
      onClick={handleClick}
      variant="secondary"
      rounded="none"
      active={isActive}
      tooltip={
        isActive
          ? t("contextPanel.connectorSmartJump.off")
          : t("contextPanel.connectorSmartJump.on")
      }
      tooltipPosition="top"
    >
      <Icon iconName="Switch" />
    </UiButton>
  );
}
