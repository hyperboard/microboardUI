import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { ColorPicker } from "features/Pickers/ColorPicker/ColorPicker";
import { conf, Sticker } from "microboard-temp";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

const MENU_NAME = "StickerFillStyle";

export function StickerFillStyle(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const color = board.selection.getFillColor();

  const handleClick = (): void => {
    toggleMenu(MENU_NAME);
  };
  const handlePick = (color: string): void => {
    board.selection.setFillColor(color);
    const sticker = board.selection.items.getSingle();
    if (sticker && sticker instanceof Sticker) {
      sticker.saveStickerData();
    }
    toggleMenu("None");
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
          id="sticker-fill-style"
          tooltip={t("contextPanel.stickerColor.tooltip")}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          rounded="none"
          active={openedMenu === MENU_NAME}
          hideTooltip={openedMenu === MENU_NAME}
        >
          <FillColorIndicator color={color} />
        </UiButton>
      }
    >
      {(verticalAlign) => (
        <UiPanel
          rounded={verticalAlign === "bottom" ? "bottom" : "full"}
          grid
          columns={5}
          gap={8}
        >
          <ColorPicker
            id="sticker-fill"
            selectedColor={color}
            colors={conf.STICKER_COLORS}
            onPick={handlePick}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
