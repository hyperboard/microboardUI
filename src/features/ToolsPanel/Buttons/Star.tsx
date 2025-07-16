import { getHotkeyLabel } from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { Star } from "../../../Board/Items/Examples/Star/Star";

export function AddStar() {
  const { board } = useAppContext();
  const { t } = useTranslation();

  const handleClick = () => {
    board.tools.addRegisteredTool("AddStar", true);
  };

  const isActive = Boolean(board.tools.getAddRegisteredTool("AddStar"));

  return (
    <UiButton
      id={"redo"}
      tooltip={"Star"}
      onClick={handleClick}
      variant="secondary"
      rounded="none"
      active={isActive}
    >
      <Icon iconName="Redo" />
    </UiButton>
  );
}
