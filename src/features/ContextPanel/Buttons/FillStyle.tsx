import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

const MENU_NAME = "FillStyle";

export function FillStyle(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();

  const { t } = useTranslation();

  const fillColor = board.selection.getFillColor();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handlePick = (color: string): void => {
    board.selection.setFillColor(color);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    board.selection.setFillColor(color);
  };

  const isPredefinedColor = window.MICROBOARD_CONFIG.SHAPE_FILL_COLORS.some(
    (color) => color === fillColor,
  );
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
          tooltip={t("contextPanel.fillStyle.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <FillColorIndicator width={24} height={24} color={fillColor} />
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
          <ColorPicker
            id={"fill-style"}
            selectedColor={fillColor}
            colors={window.MICROBOARD_CONFIG.SHAPE_FILL_COLORS}
            onPick={handlePick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isPredefinedColor ? "none" : fillColor}
            isActive={fillColor !== "none" && !isPredefinedColor}
            toggleMenu={toggleMenu}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
