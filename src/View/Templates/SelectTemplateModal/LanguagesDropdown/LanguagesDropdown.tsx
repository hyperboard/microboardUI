import React, { useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../Icon";
import { Chevron } from "shared/ui-lib/Dropdown/Chevron";
import styles from "./LanguagesDropdown.module.css";
import { LANGUAGES } from "View/Tools/Template";
import { useTranslation } from "react-i18next";

// This component will be removed after the dropdown from ui lib could be customized

interface Props {
	setSelectedLanguage: (lan: string) => void;
	selectedLanguage: string;
}

export const LanguagesDropdown = ({
	setSelectedLanguage,
	selectedLanguage,
}: Props) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { t } = useTranslation();

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
					{LANGUAGES.map(({ value }) => (
						<li
							key={value}
							className={clsx(
								styles.dropdownItem,
								selectedLanguage === value &&
									styles.dropdownItemActive,
							)}
							onClick={() => setSelectedLanguage(value)}
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
