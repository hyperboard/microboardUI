import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card, getHotkeyLabel } from "microboard-temp";
import { useTranslation } from "react-i18next";

interface Props {
  rounded?: string;
}

export function FlipCard({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = (): void => {
    const cards = board.selection.items.list() as Card[];
    cards[0].toggleIsOpen(cards);
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="flip-card"
      tooltip={t("contextPanel.gameItems.card.flip")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      hotkey={getHotkeyLabel("flipDeckOrCard")}
    >
      <Icon iconName="RotateCard" width={24} height={24} />
    </UiButton>
  );
}
