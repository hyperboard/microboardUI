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
  ) as Array<
    Connector & {
      getSmartJump?: () => boolean;
      setSmartJump?: (nextValue: boolean) => void;
    }
  >;

  if (
    connectors.length === 0 ||
    connectors.some(
      (connector) =>
        typeof connector.getSmartJump !== "function" ||
        typeof connector.setSmartJump !== "function",
    )
  ) {
    return null;
  }
  const smartJumpConnectors = connectors as Array<
    Connector & {
      getSmartJump: () => boolean;
      setSmartJump: (nextValue: boolean) => void;
    }
  >;

  const isActive = smartJumpConnectors.every((c) => c.getSmartJump());

  const handleClick = useCallback(() => {
    smartJumpConnectors.forEach((c) => c.setSmartJump(!isActive));
  }, [smartJumpConnectors, isActive]);

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
      <span style={{ position: "relative", display: "inline-flex" }}>
        <Icon iconName="Switch" />
        <Icon
          iconName={isActive ? "lock" : "unlock"}
          width={12}
          height={12}
          style={{ position: "absolute", inset: 0, margin: "auto" }}
        />
      </span>
    </UiButton>
  );
}
