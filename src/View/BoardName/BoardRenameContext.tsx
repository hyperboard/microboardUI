import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, {
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useState,
} from "react";
import { useAppContext } from "View/AppContext";

const BoardRenameContext = createStrictContext<{
	renamingBoardId: string | null;
	setRenamingBoardId: Dispatch<SetStateAction<string | null>>;
	setNewBoardName: Dispatch<SetStateAction<string>>;
	newBoardName: string;
	rename: () => void;
}>();

export const useBoardRenameContext = () => {
	return useStrictContext(BoardRenameContext);
};

export function BoardRenameContextProvider({
	children,
}: PropsWithChildren<{}>) {
	const [renamingBoardId, setRenamingBoardId] = useState<string | null>(null);
	const [newBoardName, setNewBoardName] = useState<string>("");
	const { app } = useAppContext();

	const rename = () => {
		if (!renamingBoardId) {
			return;
		}
		app.storage.renameBoard(renamingBoardId, newBoardName);
	};
	return (
		<BoardRenameContext.Provider
			value={{
				renamingBoardId,
				setRenamingBoardId,
				rename,
				newBoardName,
				setNewBoardName,
			}}
		>
			{children}
		</BoardRenameContext.Provider>
	);
}
