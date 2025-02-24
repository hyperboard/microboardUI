import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useState, type PropsWithChildren } from "react";

type OpenedFoldersContextPayload = {
	id: string | number | null;
	setId: (id: string | number | null) => void;
};

const OpenedFoldersContext = createStrictContext<OpenedFoldersContextPayload>();

export const useOpenedFoldersContext = () =>
	useStrictContext(OpenedFoldersContext);

export const OpenedFoldersContextProvider = ({
	children,
}: PropsWithChildren<{}>) => {
	const [id, setId] = useState<string | number | null>(null);

	return (
		<OpenedFoldersContext.Provider value={{ setId, id }}>
			{children}
		</OpenedFoldersContext.Provider>
	);
};
