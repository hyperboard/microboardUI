import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { StrokeColorIndicator } from "shared/ui-lib/Icon";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { SliderPicker } from "features/Pickers/SliderPicker";
import { StrokeStylePicker } from "features/Pickers/StrokeStylePicker/StrokeStylePicker";
import {
  MAX_STROKE_WIDTH,
  MIN_STROKE_WIDTH,
  STEP_STROKE_WIDTH,
  BorderStyle,
  Shape,
} from "microboard-temp";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import style from "./StrokeStyle.module.css";
import { useAppContext } from "features/AppContext";
import btnStyle from "../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { resolveColorForUI, getSemanticId } from "shared/lib/resolveColorValue";

const MENU_NAME = "StrokeStyle";

const getIsBorderStyleEditable = (shapes: Shape[]): boolean => {
  if (!shapes.length) {
    return false;
  }
  for (const shape of shapes) {
    if (!shape.getIsBorderStyleEditable()) {
      return false;
    }
  }
  return true;
};

interface Props {
  rounded?: string;
}

export function StrokeStyle({
  rounded = "none",
}: Props): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const rawBorderColor = board.selection.getStrokeColor();
  const borderColor = resolveColorForUI(
    rawBorderColor as unknown,
    "foreground",
  );
  const borderWidth = board.selection.getStrokeWidth();
  const borderStyle = board.selection.getBorderStyle();

  const isBorderStyleEditable = getIsBorderStyleEditable(
    board.selection.items.getItemsByItemTypes(["Shape"]) as Shape[],
  );

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleStrokeWidthPick = (width: number): void => {
    board.selection.setStrokeWidth(width);
  };

  const handleStrokeStylePick = (style: BorderStyle): void => {
    board.selection.setStrokeStyle(style);
    toggleMenu("None");
  };

  const handleStrokeColorPick = (color: string): void => {
    board.selection.setStrokeColor(color);
    toggleMenu("None");
  };

  const handleStrokeCustomColorPick = (color: string): void => {
    board.selection.setStrokeColor(color);
  };

  const isSemanticStroke = getSemanticId(rawBorderColor as unknown) !== null;

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
          id={"stroke-style"}
          tooltip={t("contextPanel.strokeStyle.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded={rounded}
        >
          <StrokeColorIndicator color={borderColor} />
        </UiButton>
      }
    >
      {(verticalAlign) => (
        <UiPanel
          rounded={verticalAlign === "bottom" ? "bottom" : "full"}
          vertical
          className={style.menu}
        >
          {isBorderStyleEditable && (
            <div className={style.panel}>
              <StrokeStylePicker
                stroke={borderStyle}
                onPick={handleStrokeStylePick}
              />
            </div>
          )}
          <SliderPicker
            value={borderWidth}
            onPick={handleStrokeWidthPick}
            min={MIN_STROKE_WIDTH}
            max={MAX_STROKE_WIDTH}
            step={STEP_STROKE_WIDTH}
            showLabel
            id="shape-stroke-width"
          />
          <div className={style.colors}>
            <SemanticColorPicker
              id={"stroke-style"}
              currentValue={rawBorderColor as unknown}
              onPick={handleStrokeColorPick}
            />
            <UiColorInput
              onChange={handleStrokeCustomColorPick}
              color={isSemanticStroke ? "none" : borderColor}
              isActive={borderColor !== "none" && !isSemanticStroke}
              toggleMenu={toggleMenu}
            />
          </div>
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
