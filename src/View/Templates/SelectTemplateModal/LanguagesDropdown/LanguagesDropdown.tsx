import React, { useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../Icon";
import styles from "./LanguagesDropdown.module.css";
import { LANGUAGES } from "View/Tools/Template";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "lib/useClickOutside";

interface Props {
	setSelectedLanguage: (lan: string) => void;
	selectedLanguage: string;
}

export const LanguagesDropdown = ({
	setSelectedLanguage,
	selectedLanguage,
}: Props) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useClickOutside(() => setIsDropdownOpen(false));
	const { t } = useTranslation();

	const toggleDropdown = (): void => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleSelectLanguage = (language: string): void => {
		setSelectedLanguage(language);
		setIsDropdownOpen(false);
	};

	return (
		<div ref={dropdownRef} className={styles.dropdown}>
			<button onClick={toggleDropdown} className={styles.dropdownButton}>
				<Icon width={16} height={16} iconName="Planet" />
				{t(`common.languages.${selectedLanguage}`)}
				<Icon
					iconName={
						isDropdownOpen ? "StrokeChevronUp" : "StrokeChevronDown"
					}
					width={14}
					height={14}
				/>
			</button>
			{isDropdownOpen && (
				<ul className={styles.dropdownMenu}>
					{LANGUAGES.map(({ value }) => (
						<li
							key={value}
							className={clsx(
								styles.dropdownItem,
								selectedLanguage === value &&
									styles.dropdownItemActive,
							)}
							onClick={() => handleSelectLanguage(value)}
						>
							{t(`common.languages.${value}`)}
							{selectedLanguage === value && (
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
