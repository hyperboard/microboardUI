import React from "react";
import { useAppContext } from "features/AppContext";
import { Connector } from "microboard-temp";
import { TextHighlight } from "./TextHighlight";
import { UiSeparator } from "shared/ui-lib/UiSeparator";

export function ConnectorTextHighlight(): React.ReactElement | null {
  const { board } = useAppContext();

  const connector = board.selection.items.getItemsByItemTypes([
    "Connector",
  ])[0] as Connector | undefined;
  const context = board.selection.getContext();
  if (context !== "EditTextUnderPointer" && connector && !connector.hasText()) {
    return null;
  }

  return (
    <>
      <TextHighlight />
      <UiSeparator vertical />
    </>
  );
}
