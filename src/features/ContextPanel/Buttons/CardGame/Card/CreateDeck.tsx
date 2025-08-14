import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card, Deck, getHotkeyLabel } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { BaseItem } from "microboard-temp/dist/types/Items/BaseItem";

function sortItemsByPosition(items: BaseItem[]) {
  return items.sort((a, b) => {
    if (a.top < b.top) return -1;
    if (a.top > b.top) return 1;

    if (a.left < b.left) return -1;
    if (a.left > b.left) return 1;

    return 0;
  });
}

interface Props {
  rounded?: string;
  onlyCards: boolean;
}

export function CreateDeck({ rounded = "none", onlyCards }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const single = board.selection.items.getSingle();
  if (single && single.itemType === "Deck") {
    return null;
  }

  const cardsOrDecks = sortItemsByPosition(board.selection.items.list());

  const handleClick = (): void => {
    if (onlyCards) {
      const deck = new Deck(board, "");
      deck.transformation.apply({
        class: "Transformation",
        method: "translateTo",
        item: [deck.getId()],
        x: cardsOrDecks[0].left,
        y: cardsOrDecks[0].top,
      });
      const addedDeck = board.add(deck);
      board.selection.items.removeAll();
      addedDeck.addChildItems(cardsOrDecks);
      board.selection.items.add(addedDeck);
    } else {
      let mainDeck: Deck | null = null;
      const cards: Card[] = [];
      cardsOrDecks.forEach((item) => {
        if (item.itemType === "Card") {
          cards.push(item);
        } else if (item.itemType === "Deck") {
          if (mainDeck) {
            cards.push(...item.getDeck());
            board.remove(item);
          } else {
            mainDeck = item;
          }
        }
      });
      board.selection.items.removeAll();
      mainDeck.addChildItems(cards);
      board.selection.items.add(mainDeck);
    }
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="create-deck"
      tooltip={t("contextPanel.gameItems.deck.create")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      hotkey={getHotkeyLabel("createDeck")}
    >
      <Icon iconName="Stack" />
    </UiButton>
  );
}
