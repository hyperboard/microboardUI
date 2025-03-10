import type { App } from "App";
import React from "react";
import { Outlet } from "react-router-dom";
import { AIContextProvider } from "entities/AIInput";
import { AppContext } from "features/AppContext";
import { ContextMenuContextProvider } from "features/ContextMenu";
import { CryptoWrapper } from "features/ContextWrapper";
import { OpenedFoldersContextProvider } from "entities/Folder";
import { HyperLinkContextProvider } from "features/hyperLink";
import ModalsWrapper from "features/Modal/ModalsWrapper";
import { RenameContextProvider } from "features/Rename";
import { SidePanelContextProvider } from "features/SidePanel/SidePanelContext";
import { ToastProvider } from "features/ToastProvider";

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
	ModalsWrapper,
	ContextMenuContextProvider,
	RenameContextProvider,
	OpenedFoldersContextProvider,
	SidePanelContextProvider,
];

const Provider = compose(PROVIDERS);

export function AppLayout({ app }: Props) {
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
