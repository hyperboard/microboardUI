import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { FillColorIndicator } from "shared/ui-lib/Icon/FillColorIndicator";
import { SemanticColorPicker } from "features/Pickers/ColorPicker/SemanticColorPicker";
import { Sticker } from "microboard-temp";
import { UiPanel } from "shared/ui-lib/UiPanel/UiPanel";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { resolveColorForUI } from "shared/lib/resolveColorValue";

const MENU_NAME = "StickerFillStyle";

export function StickerFillStyle(): React.ReactElement | null {
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();
  const { board } = useAppContext();
  const { t } = useTranslation();

  const rawColor = board.selection.getFillColor();
  const color = resolveColorForUI(rawColor as unknown);

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
          columns={6}
          rows={2}
          gap={8}
        >
          <SemanticColorPicker
            id="sticker-fill"
            currentValue={rawColor as unknown}
            onPick={handlePick}
            variant="square"
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
