import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { resolveColorForUI, getSemanticId } from "shared/lib/resolveColorValue";

const MENU_NAME = "ConnectorLineColor";

export function ConnectorLineColor(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board, app } = useAppContext();

  const { t } = useTranslation();

  const rawLineColor = board.selection.getConnectorLineColor();
  const connectorLineColor = resolveColorForUI(
    rawLineColor as unknown,
    "foreground",
  );

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handlePick = (color: string): void => {
    board.selection.setStrokeColor(color);
    app.sessionStorage.setConnectorFillColor(color);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    app.sessionStorage.setConnectorFillColor(color);
    board.selection.setStrokeColor(color);
  };

  const isSemanticLine = getSemanticId(rawLineColor as unknown) !== null;

  return (
    <ButtonWithMenu
      menuName={MENU_NAME}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      align="left"
      button={
        <UiButton
          className={btnStyle.contextPanelButton}
          id={"fill-style"}
          tooltip={t("contextPanel.connectorColor.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <FillColorIndicator
            width={24}
            height={24}
            color={connectorLineColor}
          />
        </UiButton>
      }
    >
      {(verticalAlign) => (
        <UiPanel
          rounded={verticalAlign === "bottom" ? "bottom" : "full"}
          grid
          columns={4}
          gap={8}
        >
          <SemanticColorPicker
            id={"connector-line-color"}
            currentValue={rawLineColor as unknown}
            onPick={handlePick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isSemanticLine ? "none" : connectorLineColor}
            isActive={connectorLineColor !== "none" && !isSemanticLine}
            toggleMenu={toggleMenu}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
