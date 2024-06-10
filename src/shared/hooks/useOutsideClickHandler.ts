import { useRef, useEffect } from "react";

export const useOutsideClickHandler = (
	ref: React.MutableRefObject<HTMLElement | null>,
	onOutsideClick: () => void,
	isEscHandler?: boolean,
) => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				onOutsideClick();
			}
		};

		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onOutsideClick();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		if (isEscHandler) {
			document.addEventListener("keydown", handleEscKey);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			if (isEscHandler) {
				document.removeEventListener("keydown", handleEscKey);
			}
		};
	}, [ref, onOutsideClick, isEscHandler]);
};
