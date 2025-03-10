import React, { useState } from "react";
import { useClickOutside } from "shared/lib/useClickOutside";
import { Chevron } from "./Chevron";
import styles from "./Dropdown.module.css";

interface DropdownProps {
	items: React.ReactNode[];
	label: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ items, label }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = (
		event: React.MouseEvent<HTMLButtonElement>,
	): void => {
		event.preventDefault();
		setIsOpen(!isOpen);
	};

	const closeDropdown = (): void => setIsOpen(false);

	const ref = useClickOutside<HTMLUListElement>(closeDropdown);

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
