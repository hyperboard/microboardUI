import { App } from "App";
import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "shared/hooks/useDebounce";
import { useAppContext } from "View/AppContext";

type SidePanelContext = {
	toggleSideMenu: () => void;
	openMenu: () => void;
	handleAddNew: (cb?: (boardId: string) => void) => void;
	stamp: number | null;
	setStamp: React.Dispatch<React.SetStateAction<number | null>>;
	isOpen: boolean;
};

export const SidePanelContext = createStrictContext<SidePanelContext>();

export function useSidePanelContext(): SidePanelContext {
	return useStrictContext(SidePanelContext);
}

export function SidePanelContextProvider({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const [stamp, setStamp] = useState<null | number>(null);
	const { app } = useAppContext();
	const navigate = useNavigate();

	const toggleSideMenu = (): void => {
		setIsOpen(prev => !prev);
	};

	const openMenu = (): void => {
		setIsOpen(true);
	};

	const handleAddNew = async (
		cb?: (boardId: string) => void,
	): Promise<void> => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
		if (cb) {
			cb(boardId);
		}
	};

	return (
		<SidePanelContext.Provider
			value={{
				toggleSideMenu,
				isOpen,
				openMenu,
				handleAddNew,
				stamp,
				setStamp,
			}}
		>
			{children}
		</SidePanelContext.Provider>
	);
}
