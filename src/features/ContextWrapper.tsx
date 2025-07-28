import type { App } from "App";
import type { Board } from "microboard-temp";
import React from "react";
import { Outlet } from "react-router-dom";
import { AppContext } from "./AppContext";
import { ContextMenuContextProvider } from "./ContextMenu";
import { OpenedFoldersContextProvider } from "../entities/Folder";
import ModalsWrapper from "./Modal/ModalsWrapper";
import { RenameContextProvider } from "./Rename";
import { SidePanelContextProvider } from "./SidePanel/SidePanelContext";
import { ToastProvider } from "./ToastProvider";
import { AIContextProvider } from "../entities/AIInput/AIContext";
import { HyperLinkContextProvider } from "features/hyperLink/HyperLinkContext";
import { CryptoWrapper } from "./CryptoWrapper";
import { CommentsContextProvider } from "entities/comments/CommentsContext";

type Props = {
  app: App;
  board: Board;
};

export function ContextWrapper({ app, board }: Props): React.JSX.Element {
  return (
    <CryptoWrapper>
      <AppContext.Provider value={{ app, board }}>
        <HyperLinkContextProvider>
          <CommentsContextProvider>
            <AIContextProvider>
              <ModalsWrapper>
                <ContextMenuContextProvider>
                  <RenameContextProvider>
                    <OpenedFoldersContextProvider>
                      <SidePanelContextProvider>
                        <Outlet />
                        <ToastProvider />
                      </SidePanelContextProvider>
                    </OpenedFoldersContextProvider>
                  </RenameContextProvider>
                </ContextMenuContextProvider>
              </ModalsWrapper>
            </AIContextProvider>
          </CommentsContextProvider>
        </HyperLinkContextProvider>
      </AppContext.Provider>
    </CryptoWrapper>
  );
}
