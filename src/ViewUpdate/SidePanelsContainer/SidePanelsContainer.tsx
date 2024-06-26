import { useClickOutside } from "lib/useClickOutside";
import React, { memo } from "react";
import { SidePanel, useSidePanelContext } from "ViewUpdate/SidePanel";
import { TitlePanel } from "ViewUpdate/TitlePanel";
import { ToolsPanel } from "ViewUpdate/ToolsPanel";
import style from "./SidePanelsContainer.module.css";

export const SidePanelsContainer = memo(() => {
	const { toggleSideMenu, isOpen } = useSidePanelContext();
	const containerRef = useClickOutside(() => {
		if (isOpen) {
			toggleSideMenu();
		}
	});

	return (
		<div ref={containerRef} className={style.sidePanels}>
			<TitlePanel />
			<SidePanel />
			<ToolsPanel />
		</div>
	);
});
