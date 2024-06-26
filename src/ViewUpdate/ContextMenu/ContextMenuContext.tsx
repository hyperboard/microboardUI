import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState, type ReactNode } from "react";

type ContextMenuContext = {
	open: (x: number, y: number, boardId?: string) => void;
	close: () => void;
	boardId: string | null;
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

	const open = (x: number, y: number, boardId?: string) => {
		if (boardId) {
			setBoardId(boardId);
		}

		setX(x);
		setY(y);
		setIsOpen(true);
	};

	const close = () => {
		setBoardId(null);
		setX(0);
		setY(0);
		setIsOpen(false);
	};

	return (
		<ContextMenuContext.Provider
			value={{ open, close, isOpen, x, y, boardId }}
		>
			{children}
		</ContextMenuContext.Provider>
	);
}
