import { useClickOutside } from "lib/useClickOutside";
import React, { memo, useEffect } from "react";
import { SidePanel, useSidePanelContext } from "View/SidePanel";
import { TitlePanel } from "View/TitlePanel";
import { ToolsPanel } from "View/ToolsPanel";
import style from "./SidePanelsContainer.module.css";
import { InactiveBoardHidder } from "View/AppView/InactiveBoardHidder";
import { shouldShow } from "lib/queryStringParser";
import { useAppContext } from "View/AppContext";
import { isIframe } from "lib/isIframe";
import { useBoardRenameContext } from "View/BoardName";
import { ViewModeGuard } from "View/ViewModeGuard";
import { EventList } from "View/ToolsPanel/Buttons/EventList";

interface SidePanelsContainerProps {
	isBlank: boolean;
}

export const SidePanelsContainer = memo(
	({ isBlank }: SidePanelsContainerProps) => {
		const { toggleSideMenu, isOpen } = useSidePanelContext();
		const { renamingBoardId } = useBoardRenameContext();
		const { app } = useAppContext();
		const interfaceType = app.getBoard().interfaceType;
		const containerRef = useClickOutside(() => {
			if (isOpen && !renamingBoardId) {
				toggleSideMenu();
			}
		});

		useEffect(() => {}, [isBlank, interfaceType]);
		return (
			<div ref={containerRef} className={style.sidePanels}>
				{(shouldShow("titlePanel") || !isIframe()) && <TitlePanel />}
				<SidePanel />
				<ViewModeGuard>
					<InactiveBoardHidder>
						<ToolsPanel />
					</InactiveBoardHidder>
				</ViewModeGuard>
			</div>
		);
	},
);

SidePanelsContainer.displayName = "SidePanelsContainer";
