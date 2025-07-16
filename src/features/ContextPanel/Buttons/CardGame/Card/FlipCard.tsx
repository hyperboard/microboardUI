import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card } from "microboard-temp";
import { useTranslation } from "react-i18next";

interface Props {
  rounded?: string;
}

export function FlipCard({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();

  if (!single || single.itemType !== "Card") {
    return null;
  }

  const handleClick = (): void => {
    const card = single as Card;
    card.toggleIsOpen();
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
    >
      <Icon iconName="ToggleCursors" />
    </UiButton>
  );
}
