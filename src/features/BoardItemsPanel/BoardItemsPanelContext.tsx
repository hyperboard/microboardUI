import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, { PropsWithChildren, useState } from "react";

type BoardItemsPanelContextType = {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

export const BoardItemsPanelContext =
  createStrictContext<BoardItemsPanelContextType>();

export function useBoardItemsPanelContext(): BoardItemsPanelContextType {
  return useStrictContext(BoardItemsPanelContext);
}

export function BoardItemsPanelContextProvider({
  children,
}: PropsWithChildren<{}>): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BoardItemsPanelContext.Provider
      value={{
        isOpen,
        openPanel: () => setIsOpen(true),
        closePanel: () => setIsOpen(false),
        togglePanel: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </BoardItemsPanelContext.Provider>
  );
}
