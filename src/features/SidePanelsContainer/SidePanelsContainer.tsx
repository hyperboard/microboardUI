import { isIframe } from "shared/lib/isIframe";
import { shouldShow } from "shared/lib/queryStringParser";
import { useClickOutside } from "shared/lib/useClickOutside";
import React, { memo } from "react";
import { InactiveBoardHidder } from "features/AppView/InactiveBoardHidder";
import { useRenameContext } from "features/Rename";
import { SidePanel, useSidePanelContext } from "features/SidePanel";
import { TitlePanel } from "features/TitlePanel";
import { ToolsPanel } from "features/ToolsPanel";
import { ViewToolsPanel } from "features/ToolsPanel/ViewToolsPanel";
import { ViewModeGuard } from "features/ViewModeGuard";
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
