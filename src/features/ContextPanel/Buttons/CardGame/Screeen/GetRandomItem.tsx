import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";
import { Screen } from "microboard-temp";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

interface Props {
  rounded?: string;
}

export function GetRandomItem({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const single = board.selection.items.getSingle();

  if (!single || !(single instanceof Screen) || single.getOwnerId()) {
    return null;
  }

  const handleClick = (): void => {
    const { left, top, right } = single.getMbr();
    const item = single.getRandomItem();
    if (item) {
      item.transformation.translateTo(
        (left + right) / 2 - item.getWidth() / 2,
        top - (item.getHeight() || 200),
      );
    }
  };

  return (
    <>
      <UiButton
        className={btnStyle.contextPanelButton}
        id={"get-random-item"}
        tooltip={t("contextPanel.gameItems.deck.getCard.random")}
        tooltipPosition="top"
        onClick={handleClick}
        variant="secondary"
        rounded={rounded}
      >
        <Icon iconName="GetRandomItem" width={20} height={24} />
      </UiButton>
      <UiSeparator vertical />
    </>
  );
}
