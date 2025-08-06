import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";
import { Card, Deck, getHotkeyLabel } from "microboard-temp";

interface Props {
  cardPosition: "random" | "top" | "bottom";
  rounded?: string;
}

export function GetCard({ cardPosition, rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();

  if (!single || single.itemType !== "Deck") {
    return null;
  }

  const handleClick = (): void => {
    let card: Card;
    const deck = single as Deck;
    switch (cardPosition) {
      case "random":
        card = deck.getRandomCard();
        break;
      case "top":
        card = deck.getTopCard();
        break;
      case "bottom":
        card = deck.getBottomCard();
        break;
      default:
        card = deck.getRandomCard();
        break;
    }
    const { left, top, right } = deck.getMbr();
    if (deck.getIsPerpendicular()) {
      card.transformation.translateTo(right + 280, top);
    } else {
      card.transformation.translateTo(left, top - 280);
    }
    if (deck.getDeck().length === 0) {
      board.remove(deck);
    }
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id={`get-card-${cardPosition}`}
      tooltip={t(`contextPanel.gameItems.deck.getCard.${cardPosition}`)}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      hotkey={getHotkeyLabel(`getCard-${cardPosition}`)}
    >
      <Icon iconName="GetCard" />
    </UiButton>
  );
}
