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

		window.addEventListener("mousedown", handleClickOutside);
		if (isEscHandler) {
			window.addEventListener("keydown", handleEscKey);
		}

		return () => {
			window.removeEventListener("mousedown", handleClickOutside);
			if (isEscHandler) {
				window.removeEventListener("keydown", handleEscKey);
			}
		};
	}, [ref, onOutsideClick, isEscHandler]);
};
