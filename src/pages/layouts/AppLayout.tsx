import type { App } from "App";
import React from "react";
import { Outlet } from "react-router-dom";
import { AIContextProvider } from "entities/AIInput";
import { AppContext } from "features/AppContext";
import { ContextMenuContextProvider } from "features/ContextMenu";
import { OpenedFoldersContextProvider } from "entities/Folder";
import { HyperLinkContextProvider } from "features/hyperLink";
import ModalsWrapper from "features/Modal/ModalsWrapper";
import { RenameContextProvider } from "features/Rename";
import { SidePanelContextProvider } from "features/SidePanel/SidePanelContext";
import { ToastProvider } from "features/ToastProvider";
import { LocalSidePanelContextProvider } from "features/SidePanel/LocalSidePanelContext";
import { CryptoWrapper } from "features/CryptoWrapper";
import { CommentsContextProvider } from "entities/comments/CommentsContext";

type Props = {
  app: App;
};

type ComponentWithChildren = React.ComponentType<{
  children?: React.ReactNode;
}>;

function compose(components: ComponentWithChildren[]): React.FC {
  return function ComposedComponent({
    children,
  }: {
    children?: React.ReactNode;
  }) {
    return components.reduceRight<React.ReactElement | null>(
      (acc, Component) => {
        return <Component>{acc}</Component>;
      },
      children ? <>{children}</> : <React.Fragment />,
    );
  };
}

const PROVIDERS: ComponentWithChildren[] = [
  CryptoWrapper,
  HyperLinkContextProvider,
  AIContextProvider,
  CommentsContextProvider,
  ModalsWrapper,
  ContextMenuContextProvider,
  RenameContextProvider,
  OpenedFoldersContextProvider,
  SidePanelContextProvider,
];

const LOCAL_PROVIDERS: ComponentWithChildren[] = [
  HyperLinkContextProvider,
  AIContextProvider,
  LocalSidePanelContextProvider,
];

const Provider = compose(PROVIDERS);
const LocalProvider = compose(LOCAL_PROVIDERS);

export function AppLayout({ app }: Props): React.JSX.Element {
  const board = app.getBoard();
  return (
    <AppContext.Provider value={{ app, board }}>
      <Provider>
        <Outlet />
        <ToastProvider />
      </Provider>
    </AppContext.Provider>
  );
}

export function LocalAppLayout({
  app,
  children,
}: Props & { children?: React.ReactNode }): React.JSX.Element {
  const board = app.getBoard();
  return (
    <AppContext.Provider value={{ app, board }}>
      <LocalProvider>
        {children}
        <Outlet />
      </LocalProvider>
    </AppContext.Provider>
  );
}
