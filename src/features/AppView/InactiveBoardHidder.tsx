import React, { PropsWithChildren } from "react";
import { useAppContext } from "features/AppContext";

export function InactiveBoardHidder({
  children,
}: PropsWithChildren<{}>): React.JSX.Element {
  const { app } = useAppContext();
  const appBoardId = app.getBoard().getBoardId();

  if (appBoardId === "blank") {
    return <></>;
  }
  return <>{children}</>;
}
