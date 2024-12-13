import React, {
	type CSSProperties,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = PropsWithChildren<{
	isDragging: boolean;
	draggableItem: ReactNode;
	style: CSSProperties;
}>;

export function DraggingWrapper({
	isDragging,
	draggableItem,
	children,
	style,
}: Props) {
	if (!isDragging) {
		return <>{children}</>;
	}

	return (
		<>
			{children}
			{createPortal(
				<div
					style={{
						position: "absolute",
						...style,
					}}
				>
					{draggableItem}
				</div>,
				document.getElementById("drag")!,
			)}
		</>
	);
}
