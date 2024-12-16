import type { App } from "App";
import { AppContext } from "./AppContext";
import { BoardRenameContextProvider } from "./BoardName";
import { ContextMenuContextProvider } from "./ContextMenu";
import ModalsWrapper from "./Modal/ModalsWrapper";
import { RenameContextProvider } from "./Rename";
import { SidePanelContextProvider } from "./SidePanel/SidePanelContext";
import React, { type PropsWithChildren } from "react";
import type { Board } from "Board";
import { ToastProvider } from "./ToastProvider";
import { Outlet } from "react-router-dom";
import { OpenedFoldersContextProvider } from "./Folder";

type Props = {
	app: App;
	board: Board;
};

export function ContextWrapper({ app, board }: Props) {
	return (
		<AppContext.Provider value={{ app, board }}>
			<ModalsWrapper>
				<ContextMenuContextProvider>
					<BoardRenameContextProvider>
						<RenameContextProvider>
							<OpenedFoldersContextProvider>
								<SidePanelContextProvider>
									<Outlet />
									<ToastProvider />
								</SidePanelContextProvider>
							</OpenedFoldersContextProvider>
						</RenameContextProvider>
					</BoardRenameContextProvider>
				</ContextMenuContextProvider>
			</ModalsWrapper>
		</AppContext.Provider>
	);
}
