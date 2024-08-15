import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";

type SidePanelContext = {
	toggleSideMenu: () => void;
	openMenu: () => void;
	handleAddNew: () => Promise<void>;
	isOpen: boolean;
};

export const SidePanelContext = createStrictContext<SidePanelContext>();

export function useSidePanelContext(): SidePanelContext {
	return useStrictContext(SidePanelContext);
}

export function SidePanelContextProvider({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const { app } = useAppContext();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const toggleSideMenu = (): void => setIsOpen(prev => !prev);
	const openMenu = (): void => setIsOpen(true);

	const handleAddNew = async (): Promise<void> => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
	};

	return (
		<SidePanelContext.Provider
			value={{ toggleSideMenu, isOpen, openMenu, handleAddNew }}
		>
			{children}
		</SidePanelContext.Provider>
	);
}
