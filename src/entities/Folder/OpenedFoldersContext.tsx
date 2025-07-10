import {
	createStrictContext,
	useStrictContext,
} from "shared/lib/strictContext";
import React, { useState, type PropsWithChildren } from "react";

type OpenedFoldersContextPayload = {
	id: string | number | null;
	setId: (id: string | number | null) => void;
	foldersRefState: HTMLDivElement | null;
	setFoldersRefState: (element: HTMLDivElement | null) => void;
};

const OpenedFoldersContext = createStrictContext<OpenedFoldersContextPayload>();

export const useOpenedFoldersContext = () =>
	useStrictContext(OpenedFoldersContext);

export const OpenedFoldersContextProvider = ({
	children,
}: PropsWithChildren<{}>) => {
	const [id, setId] = useState<string | number | null>(null);
	const [foldersRefState, setFoldersRefState] =
		useState<HTMLDivElement | null>(null);

	return (
		<OpenedFoldersContext.Provider
			value={{ setId, id, foldersRefState, setFoldersRefState }}
		>
			{children}
		</OpenedFoldersContext.Provider>
	);
};
