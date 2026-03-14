import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { TextHighlightIndicator } from "shared/ui-lib/Icon";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { convertHexToRGBA } from "shared/lib/convertColors";
import { resolveColorForUI, getSemanticId } from "shared/lib/resolveColorValue";

const MENU_NAME = "TextHighlight";

export function TextHighlight(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const rawHighlightColor = board.selection.getFontHighlight();
  const highlightColor = resolveColorForUI(
    rawHighlightColor as unknown,
    "background",
  );
  const isSemanticHighlight =
    getSemanticId(rawHighlightColor as unknown) !== null;

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleSemanticPick = (colorValue: string): void => {
    board.selection.setFontHighlight(colorValue);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    const rgbColor = convertHexToRGBA(color, false);
    board.selection.setFontHighlight(rgbColor);
  };

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
          id="ChangeTextHighlight"
          tooltip={t("contextPanel.textHighlight.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <TextHighlightIndicator color={highlightColor} />
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
            id={"TextHighlight"}
            currentValue={rawHighlightColor as unknown}
            onPick={handleSemanticPick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isSemanticHighlight ? "none" : highlightColor}
            isActive={highlightColor !== "none" && !isSemanticHighlight}
            toggleMenu={toggleMenu}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
