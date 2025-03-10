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
		const handleResize = () => updateRect();
		window.addEventListener("resize", handleResize);
		updateRect();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [updateRect]);

	return { elementRef, rect };
}
