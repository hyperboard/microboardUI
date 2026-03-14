import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
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
import { resolveColorForUI, getSemanticId } from "shared/lib/resolveColorValue";

const MENU_NAME = "DrawFillStyle";

export function DrawFillStyle(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();

  const { board } = useAppContext();
  const { t } = useTranslation();
  const single = board.selection.items.getSingle();
  let isHighlight = false;
  if (single?.itemType === "Drawing") {
    // Resolve the ColorValue to a CSS string before checking for alpha channel
    const rawStroke = (single as any).getStrokeColor();
    const resolvedStroke = resolveColorForUI(rawStroke, "foreground");
    if (resolvedStroke.split(",").length === 4) {
      isHighlight = true;
    }
  }

  const rawDrawingColor = board.selection.getStrokeColor();
  let drawingColor = resolveColorForUI(
    rawDrawingColor as unknown,
    "foreground",
  );

  if (isHighlight) {
    drawingColor = rgbaToRgb(drawingColor, drawingColor);
  }

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };
  const handlePick = (color: string): void => {
    if (isHighlight) {
      const resolved = resolveColorForUI(color as unknown, "foreground");
      color = rgbToRgba(resolved, 0.5, resolved);
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

  const isSemanticColor = getSemanticId(rawDrawingColor) !== null;
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
          <SemanticColorPicker
            id={"drawing"}
            currentValue={rawDrawingColor}
            onPick={handlePick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isSemanticColor ? "none" : drawingColor}
            isActive={drawingColor !== "none" && !isSemanticColor}
            toggleMenu={toggleMenu}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
