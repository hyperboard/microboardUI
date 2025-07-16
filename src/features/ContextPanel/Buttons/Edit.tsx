import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "./ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton";

export function Edit(): React.ReactElement | null {
  const { board } = useAppContext();

  const handleClick = (): void => {
    board.selection.editSelected();
  };
  return (
    <UiButton
      className={btnStyle.contextPanelButton}
      id="ContextPanelEdit"
      onClick={handleClick}
      rounded="left"
      variant="secondary"
    >
      Edit
    </UiButton>
  );
}
