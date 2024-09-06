import { useClickOutside } from "lib/useClickOutside";
import React, { memo, useEffect } from "react";
import { SidePanel, useSidePanelContext } from "View/SidePanel";
import { TitlePanel } from "View/TitlePanel";
import { ToolsPanel } from "View/ToolsPanel";
import style from "./SidePanelsContainer.module.css";
import { InactiveBoardHidder } from "View/AppView/InactiveBoardHidder";
import { showTitlePanel } from "lib/queryStringParser";

interface SidePanelsContainerProps {
	isBlank: boolean;
}

export const SidePanelsContainer = memo(
	({ isBlank }: SidePanelsContainerProps) => {
		const { toggleSideMenu, isOpen } = useSidePanelContext();
		const containerRef = useClickOutside(() => {
			if (isOpen) {
				toggleSideMenu();
			}
		});

		useEffect(() => {}, [isBlank]);

		return (
			<div ref={containerRef} className={style.sidePanels}>
				{showTitlePanel() && <TitlePanel />}
				<SidePanel />
				<InactiveBoardHidder>
					<ToolsPanel />
				</InactiveBoardHidder>
			</div>
		);
	},
);

SidePanelsContainer.displayName = "SidePanelsContainer";
