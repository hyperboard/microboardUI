import { useEffect, useRef, RefObject } from "react";

type ClickOutsideCb = () => void;

export const useClickOutside = (
	callback: ClickOutsideCb,
	refs: RefObject<HTMLElement>[] = [],
): RefObject<HTMLDivElement> => {
	const ref = useRef<HTMLDivElement>(null);

	const handleClickOutside = (event: MouseEvent): void => {
		const isOutside =
			ref.current &&
			!ref.current.contains(event.target as Node) &&
			refs.every(
				ref =>
					ref.current && !ref.current.contains(event.target as Node),
			);
		if (isOutside) {
			callback();
		}
	};

	useEffect(() => {
		document.body.addEventListener("click", handleClickOutside);
		return () => {
			document.body.removeEventListener("click", handleClickOutside);
		};
	}, [callback]);

	return ref;
};
