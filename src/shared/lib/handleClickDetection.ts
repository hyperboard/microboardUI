import type { MouseEvent, MouseEventHandler } from "react";

export function handleClickDetection(
	singleClickCb: (ev: MouseEvent) => void,
	doubleClickCb: (ev: MouseEvent) => void,
	threshold = 300,
): MouseEventHandler {
	let clickTimeout: NodeJS.Timeout | null = null;

	return ev => {
		ev.preventDefault();
		ev.stopPropagation();

		if (clickTimeout) {
			clearTimeout(clickTimeout);
			clickTimeout = null;
			doubleClickCb(ev);
		} else {
			clickTimeout = setTimeout(() => {
				singleClickCb(ev);
				clickTimeout = null;
			}, threshold);
		}
	};
}
