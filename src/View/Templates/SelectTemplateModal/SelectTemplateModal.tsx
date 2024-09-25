import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TemplateItem } from "../TemplateItem/TemplateItem";
import styles from "./SelectTemplateModal.module.css";
import { ModalSize } from "../../../shared/ui-lib/Modal/Modal";
import { Template } from "../types";
import { TemplateItemPreview } from "../TemplateItemPreview/TemplateItemPreview";
import { getApiUrl } from "../../../Config";
import { Icon } from "../../Icon";
import { IconId } from "../../Icon/Icon";
import { Input } from "../../../shared/ui-lib/Input";
import { Dropdown } from "../../../shared/ui-lib/Dropdown/Dropdown";
import { useOutsideClickHandler } from "../../../shared/hooks/useOutsideClickHandler";
import { Chevron } from "../../../shared/ui-lib/Dropdown/Chevron";
import clsx from "clsx";
import { CategoriesMenu } from "./CategoriesMenu/CategoriesMenu";

interface SelectTemplateModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export const SelectTemplateModal = ({
	isOpen,
	setIsOpen,
}: SelectTemplateModalProps): JSX.Element => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [presentedTemplate, setPresentedTemplate] = useState<Template | null>(
		null,
	);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
	const [selectedCategory, setSelectedCategory] =
		useState<string>("All templates");
	const [isBurgerActive, setIsBurgerActive] = useState(false);

	useEffect(() => {
		if (isOpen) {
			geTemplates().then(templates => setTemplates(templates));
		}
	}, [isOpen]);

	const toggleDropdown = (): void => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const geTemplates = async (): Promise<Template[]> => {
		return fetch(`${getApiUrl()}/boards/templates`, {
			method: "GET",
		})
			.then(response => response.json())
			.catch(error => {
				console.error(error);
				return [];
			});
	};

	const LANGUAGES: string[] = ["English", "Russian"];

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size={ModalSize.M}
			wrClassName={styles.modal}
		>
			{!presentedTemplate && (
				<div className={styles.wrapper}>
					<div className={styles.sidebar}>
						<div className={styles.sidebarHeader}>
							<Icon width={30} height={30} iconName="Template" />
							<h3>Templates</h3>
						</div>
						<CategoriesMenu
							setSelectedCategory={setSelectedCategory}
							selectedCategory={selectedCategory}
						/>
					</div>
					<div className={styles.templatesContainer}>
						<div className={styles.templatesContainerHeader}>
							<div className={styles.burgerMenuContainer}>
								<button
									onClick={() =>
										setIsBurgerActive(!isBurgerActive)
									}
								>
									<Icon
										iconName="BurgerMenu"
										width={32}
										height={32}
									/>
								</button>
								<div
									className={clsx(
										styles.burgerMenu,
										isBurgerActive &&
											styles.activeBurgerMenu,
									)}
								>
									<CategoriesMenu
										setSelectedCategory={
											setSelectedCategory
										}
										selectedCategory={selectedCategory}
									/>
								</div>
							</div>
							<Input
								id="search-template"
								placeholder="Search"
								prefixIcon={
									<Icon
										iconName="Search"
										width={19}
										height={19}
									/>
								}
							/>
							<span className={styles.resizeMarker}></span>
						</div>
						<div className={styles.searchOptions}>
							<p>{selectedCategory}</p>
							<div className={styles.dropdown}>
								<button
									onClick={toggleDropdown}
									className={clsx(
										styles.dropdownButton,
										isDropdownOpen && styles.dropdownActive,
									)}
								>
									<Icon
										width={16}
										height={16}
										iconName="Planet"
									/>
									{selectedLanguage}
									<Chevron />
								</button>
								{isDropdownOpen && (
									<ul className={styles.dropdownMenu}>
										{LANGUAGES.map((item, index) => (
											<li
												key={index}
												className={styles.dropdownItem}
												onClick={() =>
													setSelectedLanguage(item)
												}
											>
												{item}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
						<div className={styles.templatesGrid}>
							{templates.map(template => (
								<TemplateItem
									key={template.uniq_id}
									preview={template.preview}
									name={"Hello"}
									setPresentedTemplate={() =>
										setPresentedTemplate(template)
									}
								/>
							))}
						</div>
					</div>
				</div>
			)}
			{presentedTemplate && (
				<TemplateItemPreview
					name={"Hello"}
					language={presentedTemplate.lan}
					description={presentedTemplate.desc}
					snapshot={presentedTemplate.snapshot}
					setPresentedTemplate={setPresentedTemplate}
					setIsOpen={setIsOpen}
					tags={presentedTemplate.tags}
					viewLinkId={presentedTemplate.uniq_id}
				/>
			)}
		</Modal>
	);
};
