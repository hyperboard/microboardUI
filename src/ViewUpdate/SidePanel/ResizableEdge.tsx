import React, {
	useEffect,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";

import style from "./ResizableEdge.module.css";

type Props = {
	panelWidth: number;
	setWidth: Dispatch<SetStateAction<number>>;
};

export function ResizableEdge({ panelWidth, setWidth }: Props) {
	const resizableRef = useRef<HTMLDivElement>(null);
	const [isDown, setIsDown] = useState(false);

	const pointerDown = (event: PointerEvent) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		setIsDown(true);
	};

	const pointerMove = (event: PointerEvent) => {
		if (!isDown) {
			return;
		}
		const currentX = event.clientX;
		const newWidth = panelWidth + (currentX - panelWidth);
		setWidth(newWidth);
	};

	const pointerUp = (event: PointerEvent) => {
		event.currentTarget.releasePointerCapture(event.pointerId);
		setIsDown(false);
	};

	const pointerCancel = (event: PointerEvent) => {
		event.currentTarget.releasePointerCapture(event.pointerId);
		setIsDown(false);
	};

	useEffect(() => {
		const resizable = resizableRef.current;

		if (resizable) {
			resizable.addEventListener("pointerdown", pointerDown);
			resizable.addEventListener("pointermove", pointerMove);
			resizable.addEventListener("pointerup", pointerUp);
			resizable.addEventListener("pointercancel", pointerCancel);
		}

		return () => {
			if (resizable) {
				resizable.removeEventListener("pointerdown", pointerDown);
				resizable.removeEventListener("pointermove", pointerMove);
				resizable.removeEventListener("pointerup", pointerUp);
				resizable.removeEventListener("pointercancel", pointerCancel);
			}
		};
	}, [isDown, panelWidth]);

	return <div className={style.resizeHandle} ref={resizableRef} />;
}
