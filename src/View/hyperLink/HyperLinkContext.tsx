import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { useEffect, useState } from "react";
import { BaseSelection } from "slate";

export type HyperLinkCreationData = {
	inputPosition: { top: number; left: number } | null;
	selection: BaseSelection;
	isWatchMode: boolean;
};

interface Context {
	currentLink: string | undefined;
	setCurrentLink: (id: string | undefined) => void;
	isEditingLink: boolean;
	setIsEditingLink: (arg: boolean) => void;
	hyperLinkData: HyperLinkCreationData | null;
	setHyperLinkData: (arg: HyperLinkCreationData | null) => void;
}

export const HyperLinkContext = createStrictContext<Context>();

export function useHyperLinkContext() {
	return useStrictContext(HyperLinkContext);
}

interface Props {
	children: React.ReactNode;
}

export const HyperLinkContextProvider = ({ children }: Props): JSX.Element => {
	const [currentLink, setCurrentLink] = useState<string | undefined>();
	const [isEditingLink, setIsEditingLink] = useState(false);
	const [hyperLinkData, setHyperLinkData] =
		useState<HyperLinkCreationData | null>(null);

	useEffect(() => {
		if (!isEditingLink && hyperLinkData) {
			setHyperLinkData(null);
		}
	}, [isEditingLink]);

	return (
		<HyperLinkContext.Provider
			value={{
				currentLink,
				setCurrentLink,
				isEditingLink,
				setIsEditingLink,
				hyperLinkData,
				setHyperLinkData,
			}}
		>
			{children}
		</HyperLinkContext.Provider>
	);
};
