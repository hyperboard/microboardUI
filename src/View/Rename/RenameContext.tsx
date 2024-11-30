import { useBoardsList } from "App/useBoardsList";
import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, {
	Dispatch,
	PropsWithChildren,
	SetStateAction,
	useState,
} from "react";

const RenameContext = createStrictContext<{
	renamingId: string | number | null;
	setRenamingId: Dispatch<SetStateAction<string | number | null>>;
	setNewName: Dispatch<SetStateAction<string>>;
	newName: string;
	rename: () => Promise<void>;
}>();

export const useRenameContext = () => {
	return useStrictContext(RenameContext);
};

export function RenameContextProvider({ children }: PropsWithChildren<{}>) {
	const [renamingId, setRenamingId] = useState<string | number | null>(null);
	const [newName, setNewName] = useState<string>("");
	const boardsList = useBoardsList();
	const rename = async () => {
		if (!renamingId) {
			return;
		}
		if (typeof renamingId === "string") {
			await boardsList.rename(renamingId, newName);
			return;
		}
		if (typeof renamingId === "number") {
			await boardsList.renameFolder(renamingId, newName);
		}
	};
	return (
		<RenameContext.Provider
			value={{
				newName,
				renamingId,
				setNewName,
				setRenamingId,
				rename,
			}}
		>
			{children}
		</RenameContext.Provider>
	);
}
