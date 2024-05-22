import { useCallback, useRef } from "react";

export const useDebounce = (callback: (...args: any[]) => any, delay = 250) => {
	const timer = useRef<any>();

	const debouncedCallback = useCallback(
		(...args: Parameters<typeof callback>) => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
			timer.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay],
	);

	return debouncedCallback;
};
