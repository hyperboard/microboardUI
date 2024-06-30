import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useState } from "react";

type SidePanelContext = {
	toggleSideMenu: () => void;
	isOpen: boolean;
};

export const SidePanelContext = createStrictContext<SidePanelContext>();

export function useSidePanelContext() {
	return useStrictContext(SidePanelContext);
}

export function SidePanelContextProvider({ children }: PropsWithChildren<{}>) {
	const [isOpen, setIsOpen] = useState(false);
	const toggleSideMenu = () => setIsOpen(prev => !prev);
	return (
		<SidePanelContext.Provider value={{ toggleSideMenu, isOpen }}>
			{children}
		</SidePanelContext.Provider>
	);
}
