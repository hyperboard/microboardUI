import { isIframe } from "lib/isIframe";
import { shouldShow } from "lib/queryStringParser";
import { useClickOutside } from "lib/useClickOutside";
import React, { memo } from "react";
import { InactiveBoardHidder } from "View/AppView/InactiveBoardHidder";
import { useRenameContext } from "View/Rename";
import { SidePanel, useSidePanelContext } from "View/SidePanel";
import { TitlePanel } from "View/TitlePanel";
import { ToolsPanel } from "View/ToolsPanel";
import { ViewToolsPanel } from "View/ToolsPanel/ViewToolsPanel";
import { ViewModeGuard } from "View/ViewModeGuard";
import { ShapesPanel, ShapesPanelContextProvider } from "../ShapesPanel";
import style from "./SidePanelsContainer.module.css";

interface SidePanelsContainerProps {
	isBlank: boolean;
}

export const SidePanelsContainer = memo(
	({ isBlank }: SidePanelsContainerProps) => {
		const { toggleSideMenu, isOpen } = useSidePanelContext();
		const { renamingId } = useRenameContext();
		const containerRef = useClickOutside(() => {
			if (isOpen && renamingId !== null) {
				toggleSideMenu();
			}
		});

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
