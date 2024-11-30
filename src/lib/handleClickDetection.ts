import type { MouseEventHandler } from "react";

export function handleClickDetection(
	singleClickCb: () => void,
	doubleClickCb: () => void,
	threshold = 300,
): MouseEventHandler {
	let clickTimeout: NodeJS.Timeout | null = null;

	return ev => {
		ev.preventDefault();
		ev.stopPropagation();

		if (clickTimeout) {
			clearTimeout(clickTimeout);
			clickTimeout = null;
			doubleClickCb();
		} else {
			clickTimeout = setTimeout(() => {
				singleClickCb();
				clickTimeout = null;
			}, threshold);
		}
	};
}
