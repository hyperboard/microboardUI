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
import { TransformManyItems } from "microboard-temp/dist/types/Items/Transformation/TransformationOperations";

interface Props {
  rounded?: string;
}

const MENU_NAME = "SpreadCards";

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
      const translation: TransformManyItems = {};
      const width = cards[0].getWidth();
      cards.forEach((card, index) => {
        const id = card.getId();
        translation[id] = {
          class: "Transformation",
          method: "scaleByTranslateBy",
          item: [id],
          scale: { x: 1, y: 1 },
          translate: { x: right + 5 + width * index, y: top },
        };
      });
      board.selection.transformMany(translation, Date.now());
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
            onPick={handlePick}
          />
        </UiPanel>
      )}
    </ButtonWithMenu>
  );
}
