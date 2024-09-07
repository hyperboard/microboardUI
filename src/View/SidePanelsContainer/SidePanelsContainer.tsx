import { useClickOutside } from "lib/useClickOutside";
import React, { memo, useEffect } from "react";
import { SidePanel, useSidePanelContext } from "View/SidePanel";
import { TitlePanel } from "View/TitlePanel";
import { ToolsPanel } from "View/ToolsPanel";
import style from "./SidePanelsContainer.module.css";
import { InactiveBoardHidder } from "View/AppView/InactiveBoardHidder";
import { showTitlePanel } from "lib/queryStringParser";
import { useAppContext } from "View/AppContext";

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
		console.log("interfacetype", interfaceType);
		return (
			<div ref={containerRef} className={style.sidePanels}>
				{showTitlePanel() && <TitlePanel />}
				<SidePanel />
				<InactiveBoardHidder>
					{app.getBoard().interfaceType !== "view" && <ToolsPanel />}
				</InactiveBoardHidder>
			</div>
		);
	},
);

SidePanelsContainer.displayName = "SidePanelsContainer";
