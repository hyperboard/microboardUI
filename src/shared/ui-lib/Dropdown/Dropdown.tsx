import React, { useRef, useState } from "react";
import styles from "./Dropdown.module.css";
import { Chevron } from "./Chevron";
import { useOutsideClickHandler } from "shared/hooks/useOutsideClickHandler";

interface DropdownProps {
	items: React.ReactNode[];
	label: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ items, label }) => {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLUListElement>(null);

	const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>): void => {
		e.preventDefault();
		setIsOpen(!isOpen);
	};

	const closeDropdown = (): void => setIsOpen(false);

	useOutsideClickHandler(ref, closeDropdown);

	return (
		<div className={styles.dropdown}>
			<button onClick={toggleDropdown} className={styles.dropdownButton}>
				{label}
				<Chevron />
			</button>
			{isOpen && (
				<ul className={styles.dropdownMenu} ref={ref}>
					{items.map((item, index) => (
						<li key={index} className={styles.dropdownItem}>
							{item}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
