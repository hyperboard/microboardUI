import {
  createStrictContext,
  useStrictContext,
} from "shared/lib/strictContext";
import React, { useState } from "react";

interface Context {
  isPanelOpen: boolean;
  setIsPanelOpen: (arg: boolean) => void;
}

export const CommentsPanelContext = createStrictContext<Context>();

export function useCommentsPanelContext(): Context {
  return useStrictContext(CommentsPanelContext);
}

interface Props {
  children: React.ReactNode;
}

export const CommentsPanelContextProvider = ({
  children,
}: Props): JSX.Element => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <CommentsPanelContext.Provider
      value={{
        isPanelOpen,
        setIsPanelOpen,
      }}
    >
      {children}
    </CommentsPanelContext.Provider>
  );
};
