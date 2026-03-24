import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card, getHotkeyLabel, ImageItem } from "microboard-temp";
import { useTranslation } from "react-i18next";

interface Props {
  clockwise: boolean;
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

export function RotateItem({ clockwise, rounded = "none" }: Props) {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = (): void => {
    const items = board.selection.items.list() as Card[] | ImageItem[];
    items.forEach((item) => {
      item.rotate(clockwise);
    });
  };

  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="rotate-item"
      tooltip={t(
        `contextPanel.rotateItem.${clockwise ? "clockwise" : "counterclockwise"}`,
      )}
      tooltipPosition="top"
      onClick={handleClick}
      variant="secondary"
      rounded={rounded}
      hotkey={getHotkeyLabel(`Rotate90deg${clockwise ? "-clockwise" : ""}`)}
    >
      <Icon iconName={clockwise ? "Redo" : "Undo"} />
    </UiButton>
  );
}
