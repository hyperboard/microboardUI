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
import { resolveColorForUI, getSemanticId } from "shared/lib/resolveColorValue";

const MENU_NAME = "TextColor";

export function TextColor(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();
  const rawFontColor = board.selection.getFontColor();
  const fontColor = resolveColorForUI(rawFontColor as unknown, "foreground");
  const isSemanticFont = getSemanticId(rawFontColor as unknown) !== null;

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handleSemanticPick = (colorValue: string): void => {
    board.selection.setFontColor(colorValue);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    const rgbColor = convertHexToRGBA(color, false);
    board.selection.setFontColor(rgbColor);
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
            currentValue={rawFontColor as unknown}
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
