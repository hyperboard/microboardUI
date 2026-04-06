import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";
import { Deck } from "microboard-temp";
import clsx from "clsx";
import style from "./SpreadCards.module.css";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { FontSizePicker } from "features/Pickers/FontSizePicker";
import { ButtonWithMenu } from "features/ContextPanel/Buttons/ButtonWithMenu";
import { usePanelContext } from "features/ContextPanel/PanelContext";
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
}

const MENU_NAME = "SpreadCards";

type ApplyMatrixItem = {
  id: string;
  matrix: {
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
  };
};

export function SpreadCards({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();
  const { toggleMenu, openedMenu, panelMbr, windowHeight } = usePanelContext();

  const single = board.selection.items.getSingle();

  if (!single || single.itemType !== "Deck") {
    return null;
  }

  const cardsCount = (single as Deck).getDeck().length;

  const values: number[] = [];
  for (let i = 1; i <= cardsCount; i++) {
    if (i > 10) {
      i = cardsCount;
    }
    values.push(i);
  }

  const handlePick = (count: number): void => {
    const deck = single as Deck;
    const { top, right } = deck.getMbr();
    const cards = deck.getCards(count);
    if (cards) {
      const width = cards[0].getMbr().getWidth();
      for (const [index, card] of cards.entries()) {
        const cardMbr = card.getMbr();
        card.apply({
          class: "Transformation",
          method: "translateTo",
          item: [card.getId()],
          translateX: right + 5 + width * index,
          translateY: top,
        } as any);
      }
      board.selection.items.removeAll();
      board.selection.add(cards);
    }
    if (deck.getDeck().length === 0) {
      board.remove(deck);
    }
    toggleMenu("None");
  };

  const handleClick = () => {
    if (openedMenu !== MENU_NAME) {
      toggleMenu(MENU_NAME);
    }
  };

  return (
    <ButtonWithMenu
      menuName={MENU_NAME}
      openedMenu={openedMenu}
      panelMbr={panelMbr}
      windowHeight={windowHeight}
      align="left"
      offset="Right"
      button={(verticalAlign) => (
        <UiButton
          className={btnStyle.contextPanelButton}
          id={`spread-cards`}
          tooltip={t(`contextPanel.gameItems.deck.spread`)}
          tooltipPosition="top"
          onClick={handleClick}
          variant="secondary"
          rounded={rounded}
        >
          <Icon iconName="SpreadCards" />
        </UiButton>
      )}
    >
      {(verticalAlign) => (
        <UiPanel
          padding={0}
          vertical
          className={clsx(style.picker)}
          rounded={verticalAlign === "bottom" ? "bottom" : "full"}
        >
          <FontSizePicker
            id={"cards-count-picker"}
            currentFontSize={5}
            fontSizes={values}
            showAuto={false}
            onPick={(size) => {
              if (typeof size === "number") {
                handlePick(size);
              }
            }}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
