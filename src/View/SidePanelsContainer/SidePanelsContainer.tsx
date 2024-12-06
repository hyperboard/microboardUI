import { isIframe } from "lib/isIframe";
import { shouldShow } from "lib/queryStringParser";
import { useClickOutside } from "lib/useClickOutside";
import React, { memo, useEffect } from "react";
import { InactiveBoardHidder } from "View/AppView/InactiveBoardHidder";
import { useBoardRenameContext } from "View/BoardName";
import { SidePanel, useSidePanelContext } from "View/SidePanel";
import { TitlePanel } from "View/TitlePanel";
import { ViewModeGuard } from "View/ViewModeGuard";
import { ShapesPanel, ShapesPanelContextProvider } from "../ShapesPanel";
import style from "./SidePanelsContainer.module.css";
import { ViewToolsPanel } from "View/ToolsPanel/ViewToolsPanel";
import { ToolsPanel } from "View/ToolsPanel";

interface SidePanelsContainerProps {
	isBlank: boolean;
}

export const SidePanelsContainer = memo(
	({ isBlank }: SidePanelsContainerProps) => {
		const { toggleSideMenu, isOpen } = useSidePanelContext();
		const { renamingBoardId } = useBoardRenameContext();
		const containerRef = useClickOutside(() => {
			if (isOpen && !renamingBoardId) {
				toggleSideMenu();
			}
		});

		useEffect(() => {}, [isBlank]);
		return (
			<ShapesPanelContextProvider>
				<div ref={containerRef} className={style.sidePanels}>
					{(shouldShow("titlePanel") || !isIframe()) && (
						<TitlePanel />
					)}
					<ViewModeGuard iframe>
						<div className={style.hidingPanels}>
							<SidePanel />
							<ShapesPanel />
						</div>
						<InactiveBoardHidder>
							<ViewModeGuard mode={["edit", "view"]}>
								{interfaceType => {
									switch (interfaceType) {
										case "view":
											return <ViewToolsPanel />;
										case "edit":
											return <ToolsPanel />;
										default:
											return null;
									}
								}}
							</ViewModeGuard>
						</InactiveBoardHidder>
					</ViewModeGuard>
				</div>
			</ShapesPanelContextProvider>
		);
	},
);

SidePanelsContainer.displayName = "SidePanelsContainer";
