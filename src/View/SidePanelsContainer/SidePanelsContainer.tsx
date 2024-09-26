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

interface SidePanelsContainerProps {
	isBlank: boolean;
}

export const SidePanelsContainer = memo(
	({ isBlank }: SidePanelsContainerProps) => {
		const { toggleSideMenu, isOpen } = useSidePanelContext();
		const { app } = useAppContext();
		const interfaceType = app.getBoard().interfaceType;
		const containerRef = useClickOutside(() => {
			if (isOpen) {
				toggleSideMenu();
			}
		});

		useEffect(() => {}, [isBlank, interfaceType]);
		return (
			<div ref={containerRef} className={style.sidePanels}>
				{(shouldShow("titlePanel") || !isIframe()) && <TitlePanel />}
				<SidePanel />
				<InactiveBoardHidder>
					<ToolsPanel />
				</InactiveBoardHidder>
			</div>
		);
	},
);

SidePanelsContainer.displayName = "SidePanelsContainer";
