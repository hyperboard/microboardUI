import React, { useRef } from "react";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useAppContext } from "features/AppContext";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { createPortal } from "react-dom";

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
			hoveredItem.getShouldShowControls() &&
			hoveredItem.getPreviewUrl()
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

	return createPortal(
		<div
			ref={playBtnRef}
			style={{
				position: "fixed",
				cursor: "pointer",
				top: mbr.top,
				left: mbr.left,
				width: mbr.getWidth(),
				height: mbr.getHeight(),
				zIndex: 3,
			}}
			onClick={onClick}
		></div>,
		document.body,
	);
};
