import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState, type ReactNode } from "react";

type ContextMenuContext = {
	open: (x: number, y: number, boardId?: string, folderId?: number) => void;
	close: () => void;
	setIds: (boardId?: string, folderId?: number) => void;
	boardId: string | null;
	folderId: number | null;
	x: number;
	y: number;
	isOpen: boolean;
};

const ContextMenuContext = createStrictContext<ContextMenuContext>();

export function useContextMenuContext() {
	return useStrictContext(ContextMenuContext);
}

type Props = {
	children: ReactNode;
};

export function ContextMenuContextProvider({ children }: Props) {
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const [boardId, setBoardId] = useState<null | string>(null);
	const [folderId, setFolderId] = useState<null | number>(null);

	const setIds = (boardId?: string, folderId?: number) => {
		if (boardId && !folderId) {
			setBoardId(boardId);
			setFolderId(null);
		}
		if (!boardId && folderId) {
			setBoardId(null);
			setFolderId(folderId);
		}
		if (boardId && folderId) {
			setFolderId(folderId);
			setBoardId(boardId);
		}
		if (!boardId && !folderId) {
			setFolderId(null);
			setBoardId(null);
		}
	};

	const open = (
		x: number,
		y: number,
		boardId?: string,
		folderId?: number,
	) => {
		setIds(boardId, folderId);
		setX(x);
		setY(y);
		setIsOpen(true);
	};

	const close = () => {
		setX(0);
		setY(0);
		setIsOpen(false);
	};

	return (
		<ContextMenuContext.Provider
			value={{ open, close, isOpen, x, y, boardId, folderId, setIds }}
		>
			{children}
		</ContextMenuContext.Provider>
	);
}
