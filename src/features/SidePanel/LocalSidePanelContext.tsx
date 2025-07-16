// import { useBoardsList } from "App/useBoardsList";
import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { AIContextProvider } from "entities/AIInput/AIContext";
// import { useNavigate } from "react-router-dom";
// import { useAppContext } from "features/AppContext";
// import { useContextMenuContext } from "features/ContextMenu";
// import { useOpenedFoldersContext } from "features/Folder";

type SidePanelContext = {
  openMenu: (highlightTime?: number) => void;
  stamp: number | null;
  setStamp: React.Dispatch<React.SetStateAction<number | null>>;
  isOpen: boolean;
  isHighlighted: boolean;
};

export const LocalSidePanelContext = createStrictContext<SidePanelContext>();

export function useLocalSidePanelContext(): SidePanelContext {
  return useStrictContext(LocalSidePanelContext);
}

export function LocalSidePanelContextProvider({
  children,
}: PropsWithChildren<{}>): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [stamp, setStamp] = useState<null | number>(null);
  const [highlighted, setHighlighted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const openMenu = (highlightTime = 0): void => {
    clearTimeout(timeoutRef.current);

    if (highlightTime > 0) {
      setHighlighted(true);
      timeoutRef.current = setTimeout(() => {
        setHighlighted(false);
      }, highlightTime);
    }
    setIsOpen(true);
  };

  return (
    <AIContextProvider>
      <LocalSidePanelContext.Provider
        value={{
          isOpen,
          openMenu,
          stamp,
          setStamp,
          isHighlighted: highlighted,
        }}
      >
        {children}
      </LocalSidePanelContext.Provider>
    </AIContextProvider>
  );
}
