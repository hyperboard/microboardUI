import React, { useRef } from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { useAIContext } from "entities/AIInput/AIContext";

export const AiGenerationButton = () => {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();
	const { tryToSendGenerationRequest } = useAIContext();

	useAppSubscription({
		subjects: ["pointer"],
		observer: () => forceUpdate(),
	});
	const buttonContainerRef = useRef<HTMLDivElement>(null);
	const hoveredItem = board.items.getUnderPointer().pop();
	const getCanvasButtonMbr = () => {
		if (hoveredItem && hoveredItem.itemType === "AINode") {
			return hoveredItem
				.getButtonMbr()
				.getTransformed(board.camera.getMatrix());
		}
		return undefined;
	};
	const mbr = getCanvasButtonMbr();

	const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (hoveredItem) {
			board.selection.add(hoveredItem);
			tryToSendGenerationRequest();
		}
	};

	if (!mbr) {
		return null;
	}

	return (
		<div
			ref={buttonContainerRef}
			style={{
				position: "absolute",
				cursor: "pointer",
				top: mbr.top,
				left: mbr.left,
				width: mbr.getWidth(),
				height: mbr.getHeight(),
			}}
			onClick={onClick}
		></div>
	);
};
