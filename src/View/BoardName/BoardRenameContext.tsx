import { useBoardsList } from "App/useBoardsList";
import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, {
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useState,
} from "react";

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
	const boardsList = useBoardsList();
	const rename = () => {
		if (!renamingBoardId) {
			return;
		}
		boardsList.rename(renamingBoardId, newBoardName);
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
