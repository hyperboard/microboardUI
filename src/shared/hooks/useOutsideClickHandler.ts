import { useEffect } from "react";

export const useOutsideClickHandler = (
	ref: React.MutableRefObject<HTMLElement | null>,
	onOutsideClick: () => void,
	isEscHandler?: boolean,
): void => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				onOutsideClick();
			}
		};

		const handleEscKey = (event: KeyboardEvent): void => {
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
