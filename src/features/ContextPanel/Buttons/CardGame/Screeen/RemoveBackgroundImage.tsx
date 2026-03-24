import { useAppContext } from "features/AppContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import btnStyle from "../../ContextPanelButton.module.css";
import { Screen } from "microboard-temp";

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

export function RemoveBackgroundImage({ rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const screens = board.selection.items.list() as Screen[];

  const handleClick = (): void => {
    screens.forEach((screen: Screen) => {
      if (screen.backgroundUrl) {
        screen.setBackgroundUrl(undefined);
      }
    });
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="remove-background-image"
      tooltip={t("contextPanel.gameItems.screen.removeBackgroundImage")}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
    >
      <Icon iconName="modalCross" />
    </UiButton>
  );
}
