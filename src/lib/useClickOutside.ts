import { useEffect, useRef, RefObject } from "react";

type ClickOutsideCb = () => void;

export const useClickOutside = (
	callback: ClickOutsideCb,
): RefObject<HTMLDivElement> => {
	const ref = useRef<HTMLDivElement>(null);

	const handleClickOutside = (event: MouseEvent): void => {
		if (ref.current && !ref.current.contains(event.target as Node)) {
			callback();
		}
	};

	useEffect(() => {
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [callback]);

	return ref;
};
