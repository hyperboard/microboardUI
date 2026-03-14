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
import { resolveColorForUI } from "shared/lib/resolveColorValue";
import { CONTRAST_PALETTE_LIST, conf } from "microboard-temp";

const MENU_NAME = "TextHighlight";

export function TextHighlight(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const highlightColor = board.selection.getFontHighlight();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleSemanticPick = (colorValue: string): void => {
    // colorValue is a SemanticColor object — resolve to CSS string for plain-string highlight storage
    const resolved = resolveColorForUI(colorValue as unknown, "background");
    board.selection.setFontHighlight(resolved);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    const rgbColor = convertHexToRGBA(color, false);
    board.selection.setFontHighlight(rgbColor);
  };

  // A semantic swatch is active if the current highlight matches a palette background value
  const activeSemanticId =
    CONTRAST_PALETTE_LIST.find((pair) => {
      const bg = conf.theme === "light" ? pair.light : pair.dark;
      return bg === highlightColor;
    })?.id ?? null;

  const isSemanticHighlight = activeSemanticId !== null;

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
            currentValue={{ type: "semantic", id: activeSemanticId } as unknown}
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
