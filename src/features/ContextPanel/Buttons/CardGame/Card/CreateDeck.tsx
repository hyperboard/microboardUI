import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card, Deck } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { createDeck } from "microboard-temp/dist/types/Items/Examples/CardGame/Deck";

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

  const handleClick = (): void => {
    createDeck(undefined, board);
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
    >
      <Icon iconName="Stack" />
    </UiButton>
  );
}
