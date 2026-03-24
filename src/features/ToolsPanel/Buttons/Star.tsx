import React from "react";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";

export function AddStar() {
  const { board } = useAppContext();

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
