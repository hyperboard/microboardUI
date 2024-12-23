import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState, type PropsWithChildren } from "react";

type OpenedFoldersContextPayload = {
	boardId: string | null;
	setBoard: (boardId: string | null) => void;
	folderId: number | null;
	setFolder: (folderId: number | null) => void;
};

const OpenedFoldersContext = createStrictContext<OpenedFoldersContextPayload>();

export const useOpenedFoldersContext = () =>
	useStrictContext(OpenedFoldersContext);

export const OpenedFoldersContextProvider = ({
	children,
}: PropsWithChildren<{}>) => {
	const [boardId, setBoardId] = useState<string | null>(null);
	const setBoard = (boardId: string | null) => {
		setBoardId(boardId);
	};

	const [folderId, setFolderId] = useState<number | null>(null);
	const setFolder = (folderId: number | null) => {
		setFolderId(folderId);
	};

	return (
		<OpenedFoldersContext.Provider
			value={{ boardId, setBoard, folderId, setFolder }}
		>
			{children}
		</OpenedFoldersContext.Provider>
	);
};
