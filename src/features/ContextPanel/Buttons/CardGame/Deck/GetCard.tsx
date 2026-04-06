import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";
import { Card, Deck, getHotkeyLabel } from "microboard-temp";

interface Props {
  cardPosition: "random" | "top" | "bottom";
  rounded?:
    | "none"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "bottom-right"
    | "bottom-left"
    | "full";
}

export function GetCard({ cardPosition, rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();

  if (!single || single.itemType !== "Deck") {
    return null;
  }

  const handleClick = (): void => {
    const deck = single as Deck;
    let card: Card | undefined;
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
    if (!card) {
      return;
    }
    const deckMbr = deck.getMbr();
    if (deck.getIsPerpendicular()) {
      card.apply({
        class: "Transformation",
        method: "translateTo",
        item: [card.getId()],
        translateX: deckMbr.left + 280,
        translateY: deckMbr.top,
      } as any);
    } else {
      card.apply({
        class: "Transformation",
        method: "translateTo",
        item: [card.getId()],
        translateX: deckMbr.left,
        translateY: deckMbr.top - 280,
      } as any);
    }
    if (deck.getDeck().length === 0) {
      board.remove(deck);
    }
  };

  const iconName =
    cardPosition === "random"
      ? "GetRandomItem"
      : cardPosition === "bottom"
        ? "GetBottomCard"
        : "GetCard";

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
      <Icon
        iconName={iconName}
        width={cardPosition === "random" ? 20 : 24}
        height={24}
      />
    </UiButton>
  );
}
