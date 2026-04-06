import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import {
  Card,
  Deck,
  getHotkeyLabel,
  type Item,
  DefaultTransformationData,
} from "microboard-temp";
import { useTranslation } from "react-i18next";

function sortItemsByPosition(items: Item[]) {
  return items.sort((a, b) => {
    const aMbr = a.getMbr();
    const bMbr = b.getMbr();
    if (aMbr.top < bMbr.top) return -1;
    if (aMbr.top > bMbr.top) return 1;

    if (aMbr.left < bMbr.left) return -1;
    if (aMbr.left > bMbr.left) return 1;

    return 0;
  });
}

interface Props {
  rounded?:
    | "none"
    | "left"
    | "right"
    | "top"
    | "bottom"
    | "bottom-right"
    | "bottom-left"
    | "full";
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
      const firstMbr = cardsOrDecks[0].getMbr();
      const addedDeck = board.createItemAndAdd<Deck>("Deck", {
        transformation: {
          ...new DefaultTransformationData(),
          translateX: firstMbr.left,
          translateY: firstMbr.top,
        },
      });
      board.selection.items.removeAll();
      addedDeck.addChildItems(cardsOrDecks);
      board.selection.items.add(addedDeck);
    } else {
      let deckToUse: Deck | null = null;
      const cards: Card[] = [];
      for (const item of cardsOrDecks) {
        if (item instanceof Card) {
          cards.push(item);
        } else if (item instanceof Deck) {
          if (deckToUse) {
            cards.push(...item.getDeck());
            board.remove(item);
          } else {
            deckToUse = item;
          }
        }
      }
      board.selection.items.removeAll();
      if (!deckToUse) {
        return;
      }
      deckToUse.addChildItems(cards);
      board.selection.items.add(deckToUse);
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
