import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SelectTemplateModal.module.css";
import { ModalSize } from "../../../shared/ui-lib/Modal/Modal";
import { Template, TemplateCategory } from "../types";
import { TemplateItemPreview } from "./TemplateItemPreview/TemplateItemPreview";
import { getApiUrl } from "../../../Config";
import { Icon } from "../../Icon";
import { Input } from "../../../shared/ui-lib/Input";
import { Chevron } from "../../../shared/ui-lib/Dropdown/Chevron";
import clsx from "clsx";
import { CategoriesMenu } from "./CategoriesMenu/CategoriesMenu";
import i18next from "i18next";
import { useDebounce } from "../../../shared/hooks/useDebounce";
import { TemplateItemsGrid } from "./TemplateItemsGrid/TemplateItemsGrid";

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
	const [selectedLanguage, setSelectedLanguage] = useState<string>(
		i18next.language,
	);
	const [selectedCategory, setSelectedCategory] =
		useState<TemplateCategory>("All templates");
	const [inputValue, setInputValue] = useState<string>("");
	const [isBurgerActive, setIsBurgerActive] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const tag =
				selectedCategory === "All templates"
					? undefined
					: selectedCategory;
			const term = inputValue || undefined;
			geTemplates({ language: selectedLanguage, tag, term }).then(
				templates => setTemplates(templates),
			);
		}
	}, [isOpen, selectedCategory, selectedLanguage, inputValue]);

	const handleInputChange = useDebounce(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setInputValue(e.target.value),
	);

	const toggleDropdown = (): void => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const geTemplates = async (params: {
		term?: string;
		language?: string;
		tag?: TemplateCategory;
	}): Promise<Template[]> => {
		const searchParams = new URLSearchParams();
		params.language && searchParams.set("language", params.language);
		params.term && searchParams.set("term", params.term);
		params.tag && searchParams.set("tag", params.tag);
		const stringifiedParams = searchParams.toString();
		return fetch(
			`${getApiUrl()}/boards/templates${
				stringifiedParams && "?" + stringifiedParams
			}`,
			{
				method: "GET",
			},
		)
			.then(response => response.json())
			.catch(error => {
				console.error(error);
				return [];
			});
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size={ModalSize.M}
			wrClassName={styles.modal}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
		>
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
					{presentedTemplate ? (
						<TemplateItemPreview
							name={"Hello"}
							language={presentedTemplate.lan}
							description={presentedTemplate.desc}
							snapshot={presentedTemplate.snapshot}
							setPresentedTemplate={setPresentedTemplate}
							setIsOpen={setIsOpen}
							tags={presentedTemplate.tags}
							viewLinkId={presentedTemplate.uniq_id}
							relatedTemplates={templates}
						/>
					) : (
						<>
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
									onChange={handleInputChange}
									prefixIcon={
										<Icon
											iconName="Search"
											width={20}
											height={20}
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
											isDropdownOpen &&
												styles.dropdownActive,
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
											{i18next.languages.map(
												(item, index) => (
													<li
														key={index}
														className={
															styles.dropdownItem
														}
														onClick={() =>
															setSelectedLanguage(
																item,
															)
														}
													>
														{item}
													</li>
												),
											)}
										</ul>
									)}
								</div>
							</div>
							<TemplateItemsGrid
								templates={templates}
								setIsOpen={setIsOpen}
								setPresentedTemplate={setPresentedTemplate}
								className={styles.templatesGrid}
							/>
						</>
					)}
				</div>
			</div>
		</Modal>
	);
};
