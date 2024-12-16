import { useBoardsList } from "App/useBoardsList";
import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { useOpenedFoldersContext } from "View/Folder";

type SidePanelContext = {
	toggleSideMenu: () => void;
	openMenu: (highlightTime?: number) => void;
	handleAddNew: (cb?: (boardId: string) => void) => Promise<void>;
	stamp: number | null;
	setStamp: React.Dispatch<React.SetStateAction<number | null>>;
	isOpen: boolean;
	isHighlighted: boolean;
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
	const [highlighted, setHighlighted] = useState(false);
	const { app, board } = useAppContext();
	const navigate = useNavigate();
	const boardsList = useBoardsList();
	const timeoutRef = useRef<NodeJS.Timeout>();
	const { setBoard, setFolder } = useOpenedFoldersContext();
	const boardId = board?.getBoardId();

	const toggleSideMenu = (): void => {
		if (boardId !== "blank" && !isOpen) {
			setBoard(boardId);
			setFolder(null);
		}
		if (isOpen) {
			setBoard(null);
			setFolder(null);
		}
		setIsOpen(prev => !prev);
	};

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current);
	}, []);

	const openMenu = (highlightTime = 0): void => {
		clearTimeout(timeoutRef.current);

		if (highlightTime > 0) {
			setHighlighted(true);
			timeoutRef.current = setTimeout(() => {
				setHighlighted(false);
			}, highlightTime);
		}
		setIsOpen(true);
	};

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		boardsList.loadBoards();
	}, [isOpen]);

	const handleAddNew = async (
		cb?: (boardId: string) => void,
	): Promise<void> => {
		const boardId = await boardsList.createBoard();
		await app.openBoard(boardId);
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
				isHighlighted: highlighted,
			}}
		>
			{children}
		</SidePanelContext.Provider>
	);
}
