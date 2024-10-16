import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useState } from "react";

type ShapesPanelContext = {
	openShapesPanel: () => void;
	closeShapesPanel: () => void;
	isOpen: boolean;
};

export const ShapesPanelContext = createStrictContext<ShapesPanelContext>();

export function useShapesPanelContext(): ShapesPanelContext {
	return useStrictContext(ShapesPanelContext);
}

export function ShapesPanelContextProvider({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);

	const closePanel = (): void => {
		setIsOpen(false);
	};

	const openPanel = (): void => {
		setIsOpen(true);
	};

	return (
		<ShapesPanelContext.Provider
			value={{
				closeShapesPanel: closePanel,
				openShapesPanel: openPanel,
				isOpen,
			}}
		>
			{children}
		</ShapesPanelContext.Provider>
	);
}
