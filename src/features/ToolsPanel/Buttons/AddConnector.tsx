import {
  getHotkeyLabel,
  listCreateSurfaceEntries,
  type ConnectorLineStyle,
  type OverlayOptionDefinition,
  type ToolOverlayDefinition,
} from "microboard-temp";
import { useAppContext } from "features/AppContext";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ButtonWithMenu } from "./ButtonWithMenu/ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";
import { OverlayMetadataIcon } from "features/OverlayUI/OverlayMetadataIcon";

function getAddConnectorOverlay(): ToolOverlayDefinition | undefined {
  const entry = listCreateSurfaceEntries().find((surfaceEntry) => {
    if (surfaceEntry.kind === "tool") {
      return surfaceEntry.tool.toolName === "AddConnector";
    }

    return surfaceEntry.tools.some((tool) => tool.toolName === "AddConnector");
  });

  if (!entry) {
    return undefined;
  }

  if (entry.kind === "tool") {
    return entry.tool;
  }

  return entry.tools.find((tool) => tool.toolName === "AddConnector");
}

function getConnectorLineStyleOptions(): OverlayOptionDefinition[] {
  const control = getAddConnectorOverlay()?.defaults?.controls.find(
    (nextControl) => nextControl.id === "toolLineStyle",
  );

  if (!control || control.editor.kind !== "enum-icon") {
    return [];
  }

  return [
    ...control.editor.options,
    ...(control.editor.catalog?.options ?? []),
  ];
}

export function AddConnector(): React.ReactElement {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const overlay = getAddConnectorOverlay();
  const options = getConnectorLineStyleOptions();
  const [isActive, setIsActive] = useState(
    Boolean(board.tools.getAddConnector()),
  );

  const addTool = board.tools.getAddConnector();
  useEffect(() => {
    if (addTool) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [addTool]);

  const handleClick = (): void => {
    board.tools.addConnector(true);
    setIsActive(false);
  };

  const handlePick = (lineStyle: ConnectorLineStyle): void => {
    const tool = board.tools.getAddConnector();
    if (tool) {
      tool.lineStyle = lineStyle;
      board.tools.publish();
      setIsActive(false);
    }
  };

  const selectedConnector = board.tools.getAddConnector()?.lineStyle;

  return (
    <ButtonWithMenu
      button={
        <UiButton
          id={"tool-add-connector"}
          tooltip={isActive ? undefined : t("toolsPanel.addConnector.tooltip")}
          hotkey={getHotkeyLabel("connector")}
          active={isActive || !!addTool}
          onClick={handleClick}
          variant="secondary"
          rounded="none"
        >
          <OverlayMetadataIcon icon={overlay?.icon} label={overlay?.label} />
        </UiButton>
      }
      isOpen={isActive}
    >
      <UiPanel vertical padding={0}>
        {options.map((option) => (
          <UiButton
            key={option.id}
            id={`connector-${option.id}`}
            onClick={() => handlePick(option.value as ConnectorLineStyle)}
            active={selectedConnector === option.value}
            variant="secondary"
          >
            <OverlayMetadataIcon
              icon={option.icon}
              label={option.label}
              size={20}
            />
          </UiButton>
        ))}
      </UiPanel>
    </ButtonWithMenu>
  );
}
