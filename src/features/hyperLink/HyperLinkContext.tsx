import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, { useEffect, useState, type PropsWithChildren } from "react";
import { BaseSelection } from "slate";

export type HyperLinkCreationData = {
  inputPosition: { top: number; left: number } | null;
  selection: BaseSelection;
  isWatchMode: boolean;
};

interface Context {
  currentLink: string | undefined;
  setCurrentLink: (id: string | undefined) => void;
  isEditingLink: boolean;
  setIsEditingLink: (arg: boolean) => void;
  hyperLinkData: HyperLinkCreationData | null;
  setHyperLinkData: (arg: HyperLinkCreationData | null) => void;
}

export const HyperLinkContext = createStrictContext<Context>();

export function useHyperLinkContext() {
  return useStrictContext(HyperLinkContext);
}

export const HyperLinkContextProvider = ({
  children,
}: PropsWithChildren<{}>): JSX.Element => {
  const [currentLink, setCurrentLink] = useState<string | undefined>();
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [hyperLinkData, setHyperLinkData] =
    useState<HyperLinkCreationData | null>(null);

  useEffect(() => {
    if (!isEditingLink && hyperLinkData) {
      setHyperLinkData(null);
    }
  }, [isEditingLink]);

  return (
    <HyperLinkContext.Provider
      value={{
        currentLink,
        setCurrentLink,
        isEditingLink,
        setIsEditingLink,
        hyperLinkData,
        setHyperLinkData,
      }}
    >
      {children}
    </HyperLinkContext.Provider>
  );
};
