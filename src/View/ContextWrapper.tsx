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

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
	mainnet,
	polygon,
	optimism,
	arbitrum,
	base,
	sepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

type Props = {
	app: App;
	board: Board;
};

const config = getDefaultConfig({
	appName: "board_test",
	projectId: "b1c6e6a21e23505e28fe385a0da4135f",
	chains: [mainnet, polygon, arbitrum, sepolia],
});
const queryClient = new QueryClient();

export function ContextWrapper({ app, board }: Props) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
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
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
