import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useBoundingClientRect<T extends HTMLElement>() {
	const elementRef = useRef<T>(null);
	const [rect, setRect] = useState<DOMRect | null>(null);

	const updateRect = useCallback(() => {
		if (elementRef.current) {
			setRect(elementRef.current.getBoundingClientRect());
		}
	}, []);

	useLayoutEffect(() => {
		updateRect();

		const observer = new MutationObserver(() => updateRect());
		if (elementRef.current) {
			observer.observe(elementRef.current, {
				attributes: true,
				childList: true,
				subtree: true,
			});
		}

		window.addEventListener("resize", updateRect);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateRect);
		};
	}, [elementRef.current]);

	return { elementRef, rect };
}
