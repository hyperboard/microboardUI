import { createStrictContext, useStrictContext } from "lib/strictContext";
import { useState, type PropsWithChildren } from "react";
import React from "react";

type ContextPayload = {
	overFolderId: number | null;
	setOverFolderId: (folderId?: number | null) => void;
};

const FoldersContext = createStrictContext<ContextPayload>();

export function useFoldersContext() {
	return useStrictContext(FoldersContext);
}

export function FoldersContextProvider({ children }: PropsWithChildren<{}>) {
	const [overFolderId, setOverFolderId] = useState<number | null>(null);

	const handleOverFolderId = (folderId?: number | null) => {
		if (folderId) {
			setOverFolderId(folderId);
		} else {
			setOverFolderId(null);
		}
	};

	return (
		<FoldersContext.Provider
			value={{ overFolderId, setOverFolderId: handleOverFolderId }}
		>
			{children}
		</FoldersContext.Provider>
	);
}
