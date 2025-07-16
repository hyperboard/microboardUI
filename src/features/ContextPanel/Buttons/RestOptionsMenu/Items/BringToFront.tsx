import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { usePanelContext } from "features/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "shared/ui-lib/Icon";
import { getHotkeyLabel } from "microboard-temp";

export function BringToFront(): JSX.Element {
  const { board } = useAppContext();
  const { toggleMenu } = usePanelContext();
  const { t } = useTranslation();

  const handleBringToFront = (): void => {
    board.selection.bringToFront();
    toggleMenu("None");
  };

  return (
    <RestOptionsMenuItem
      onClick={handleBringToFront}
      icon={<Icon width={20} height={20} iconName="BringToFront" />}
      hotkey={getHotkeyLabel("bringToFront")}
    >
      {t("contextPanel.bringToFront.text")}
    </RestOptionsMenuItem>
  );
}
