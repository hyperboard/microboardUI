import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { TextColorIndicator } from "shared/ui-lib/Icon";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { UiColorInput } from "shared/ui-lib/UiColorInput";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { convertHexToRGBA } from "shared/lib/convertColors";

const MENU_NAME = "TextColor";

export function TextColor(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();
  const fontColor = board.selection.getFontColor();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };

  const handlePick = (color: string): void => {
    board.selection.setFontColor(color);
    toggleMenu("None");
  };

  const handleCustomPick = (color: string): void => {
    const rgbColor = convertHexToRGBA(color, false);
    board.selection.setFontColor(rgbColor);
  };

  const isPredefinedColor = window.MICROBOARD_CONFIG.TEXT_COLORS.some(
    (color) => color === fontColor,
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
          <ColorPicker
            id={"TextColor"}
            colors={window.MICROBOARD_CONFIG.TEXT_COLORS}
            selectedColor={fontColor}
            onPick={handlePick}
          />
          <UiColorInput
            onChange={handleCustomPick}
            color={isPredefinedColor ? "none" : fontColor}
            isActive={fontColor !== "none" && !isPredefinedColor}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
