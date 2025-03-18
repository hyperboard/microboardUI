import React, { useRef } from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { useForceUpdate } from "shared/lib/useForceUpdate";

export const VideoCanvasControls = () => {
	const { board } = useAppContext();
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["pointer"],
		observer: () => forceUpdate(),
	});
	const playBtnRef = useRef<HTMLDivElement>(null);
	const hoveredItem = board.items.getUnderPointer().pop();
	const getCanvasPlayBtnMbr = () => {
		if (
			hoveredItem &&
			hoveredItem.itemType === "Video" &&
			hoveredItem.getShouldShowControls()
		) {
			return hoveredItem
				.getPlayBtnMbr()
				.getTransformed(board.camera.getMatrix());
		}
		return undefined;
	};
	const mbr = getCanvasPlayBtnMbr();

	const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (hoveredItem && hoveredItem.itemType === "Video") {
			hoveredItem.setIsPlaying(true);
		}
	};

	if (!mbr) {
		return null;
	}

	return (
		<div
			ref={playBtnRef}
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
