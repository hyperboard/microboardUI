import React, { useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../Icon";
import { Chevron } from "../../../../shared/ui-lib/Dropdown/Chevron";
import i18next from "i18next";
import styles from "./LanguagesDropdown.module.css";

//This component will be removed after the dropdown from ui lib could be customized

interface Props {
	setSelectedLanguage: (lan: string) => void;
	selectedLanguage: string;
}

export const LanguagesDropdown = ({
	setSelectedLanguage,
	selectedLanguage,
}: Props) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const toggleDropdown = (): void => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	return (
		<div className={styles.dropdown}>
			<button
				onClick={toggleDropdown}
				className={clsx(
					styles.dropdownButton,
					isDropdownOpen && styles.dropdownActive,
				)}
			>
				<Icon width={16} height={16} iconName="Planet" />
				{selectedLanguage}
				<Chevron />
			</button>
			{isDropdownOpen && (
				<ul className={styles.dropdownMenu}>
					{i18next.languages.map((item, index) => (
						<li
							key={index}
							className={clsx(
								styles.dropdownItem,
								selectedLanguage === item &&
									styles.dropdownItemActive,
							)}
							onClick={() => setSelectedLanguage(item)}
						>
							{item}
							{selectedLanguage === item && (
								<Icon
									iconName="checkMark"
									width={20}
									height={20}
								/>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
