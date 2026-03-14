import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { TextColorIndicator } from "shared/ui-lib/Icon";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { convertHexToRGBA } from "shared/lib/convertColors";
import { resolveColorForUI } from "shared/lib/resolveColorValue";
import { CONTRAST_PALETTE_LIST, conf } from "microboard-temp";

const MENU_NAME = "TextColor";

export function TextColor(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();
  const fontColor = board.selection.getFontColor();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleSemanticPick = (colorValue: string): void => {
    // colorValue is a SemanticColor object — resolve to CSS string for plain-string font storage
    const resolved = resolveColorForUI(colorValue as unknown, "foreground");
    board.selection.setFontColor(resolved);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    const rgbColor = convertHexToRGBA(color, false);
    board.selection.setFontColor(rgbColor);
  };

  // A semantic swatch is active if the current font color matches a palette foreground value
  const activeSemanticId =
    CONTRAST_PALETTE_LIST.find((pair) => {
      const fg = conf.theme === "light" ? pair.dark : pair.light;
      return fg === fontColor;
    })?.id ?? null;

  const isSemanticFont = activeSemanticId !== null;

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
          id="ChangeTextColor"
          tooltip={t("contextPanel.textColor.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
          rounded="none"
        >
          <TextColorIndicator color={fontColor} />
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
            id={"TextColor"}
            currentValue={{ type: "semantic", id: activeSemanticId } as unknown}
            onPick={handleSemanticPick}
            role="foreground"
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isSemanticFont ? "none" : fontColor}
            isActive={fontColor !== "none" && !isSemanticFont}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
