import { useBoardsList } from "App/useBoardsList";
import { createStrictContext, useStrictContext } from "lib/strictContext";
import { useForceUpdate } from "lib/useForceUpdate";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
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
	const { app } = useAppContext();
	const navigate = useNavigate();
	const boardsList = useBoardsList();
	const timeoutRef = useRef<NodeJS.Timeout>();
	const { close } = useContextMenuContext();
	const forceUpdate = useForceUpdate();
	useEffect(() => {
		app.boardSubject.subscribe(forceUpdate);

		return () => app.boardSubject.unsubscribe(forceUpdate);
	}, []);

	const toggleSideMenu = (): void => {
		setIsOpen(prev => {
			console.log(prev);
			// const boardId = board?.getBoardId();
			// console.log("boardId set", boardId);
			if (prev) {
				console.log("boardId set", null);
				close();
				// setId(null);
			}
			return !prev;
		});
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
