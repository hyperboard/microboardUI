import { createStrictContext, useStrictContext } from "lib/strictContext";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { ShapeCategoryName } from "../Tools/AddShape";
import { useAppContext } from "../AppContext";
import { useLocation } from "react-router-dom";
import { tempStorage } from "App/SessionStorage";

type ShapesPanelContext = {
	openShapesPanel: () => void;
	closeShapesPanel: () => void;
	isOpen: boolean;
	selectedCategory: ShapeCategoryName;
	setSelectedCategory: (selectedCategory: ShapeCategoryName) => void;
};

export const ShapesPanelContext = createStrictContext<ShapesPanelContext>();

export function useShapesPanelContext(): ShapesPanelContext {
	return useStrictContext(ShapesPanelContext);
}

const getInitialShapeCategory = (boardId: string): ShapeCategoryName => {
	const savedShapeData = tempStorage.getShapeData(boardId);

	if (savedShapeData) {
		const splitted = savedShapeData.shapeType.split("_");
		if (splitted.length > 1) {
			return splitted[0] as ShapeCategoryName;
		}
	}
	return "basicShapes";
};

export function ShapesPanelContextProvider({
	children,
}: PropsWithChildren<{}>): JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const { board } = useAppContext();
	const [selectedCategory, setSelectedCategory] = useState<ShapeCategoryName>(
		getInitialShapeCategory(board.getBoardId()),
	);
	const location = useLocation();

	useEffect(() => {
		setSelectedCategory(getInitialShapeCategory(board.getBoardId()));
	}, [location]);

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
				selectedCategory,
				setSelectedCategory,
			}}
		>
			{children}
		</ShapesPanelContext.Provider>
	);
}
