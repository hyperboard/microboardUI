import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { conf } from "microboard-temp";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import {
  convertHexToRGBA,
  rgbaToRgb,
  rgbToRgba,
} from "shared/lib/convertColors";

const MENU_NAME = "DrawFillStyle";

export function DrawFillStyle(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();

  const { board } = useAppContext();
  const { t } = useTranslation();
  const single = board.selection.items.getSingle();
  let isHighlight = false;
  if (single?.itemType === "Drawing") {
    if (single.getStrokeColor().split(",").length === 4) {
      isHighlight = true;
    }
  }

  let drawingColor = board.selection.getStrokeColor();

  if (isHighlight) {
    drawingColor = rgbaToRgb(drawingColor, drawingColor);
  }

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };
  const handlePick = (color: string): void => {
    if (isHighlight) {
      color = rgbToRgba(color, 0.5, color);
    }
    board.selection.setStrokeColor(color);
    toggleMenu("None");
  };
  const handleCustomPick = (color: string): void => {
    if (isHighlight) {
      color = convertHexToRGBA(color, true, 0.5);
    }
    board.selection.setStrokeColor(color);
  };

  const isPredefinedColor = conf.PEN_COLORS.some(
    (color) => color === drawingColor,
  );
  return (
    <ButtonWithMenu
      menuName={MENU_NAME}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      align="center"
      button={
        <UiButton
          className={btnStyle.contextPanelButton}
          id={"drawing-fill-style"}
          tooltip={t("contextPanel.penColor.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <FillColorIndicator color={drawingColor} />
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
            id={"drawing"}
            selectedColor={drawingColor}
            colors={conf.PEN_COLORS}
            onPick={handlePick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isPredefinedColor ? "none" : drawingColor}
            isActive={drawingColor !== "none" && !isPredefinedColor}
            toggleMenu={toggleMenu}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
