import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";
import { Deck, getHotkeyLabel } from "microboard-temp";

interface Props {
  rounded?: string;
}

export function FlipDeck({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const deck = board.selection.items.getSingle();

  if (!deck || !(deck instanceof Deck)) {
    return null;
  }

  const handleClick = (): void => {
    deck.flipDeck();
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="flip-deck"
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
