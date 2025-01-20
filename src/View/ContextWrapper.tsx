import type { App } from "App";
import type { Board } from "Board";
import React from "react";
import { Outlet } from "react-router-dom";
import { AppContext } from "./AppContext";
import { BoardRenameContextProvider } from "./BoardName";
import { ContextMenuContextProvider } from "./ContextMenu";
import { OpenedFoldersContextProvider } from "./Folder";
import ModalsWrapper from "./Modal/ModalsWrapper";
import { RenameContextProvider } from "./Rename";
import { SidePanelContextProvider } from "./SidePanel/SidePanelContext";
import { ToastProvider } from "./ToastProvider";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { arbitrum, mainnet, polygon } from "wagmi/chains";
import { AIContextProvider } from "./AIInput/AIContext";

type Props = {
	app: App;
	board: Board;
};

const config = getDefaultConfig({
	appName: "board_test",
	projectId: "b1c6e6a21e23505e28fe385a0da4135f",
	chains: [mainnet, polygon, arbitrum],
});
const queryClient = new QueryClient();

export function ContextWrapper({ app, board }: Props) {
	return (
		<AppContext.Provider value={{ app, board }}>
			<WagmiProvider config={config}>
				<AIContextProvider>
					<QueryClientProvider client={queryClient}>
						<RainbowKitProvider>
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
						</RainbowKitProvider>
					</QueryClientProvider>
				</AIContextProvider>
			</WagmiProvider>
		</AppContext.Provider>
	);
}
