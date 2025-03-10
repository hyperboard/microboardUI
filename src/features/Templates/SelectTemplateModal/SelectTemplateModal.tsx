import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SelectTemplateModal.module.css";
import { TemplateItemPreview } from "./TemplateItemPreview/TemplateItemPreview";
import { getApiUrl } from "Config";
import { Icon } from "../../../shared/ui-lib/Icon";
import { Input } from "shared/ui-lib/Input/Input";
import clsx from "clsx";
import { CategoriesMenu } from "./CategoriesMenu/CategoriesMenu";
import i18next from "i18next";
import { useDebounce } from "shared/lib/useDebounce";
import { TemplateItemsGrid } from "./TemplateItemsGrid/TemplateItemsGrid";
import { Template, TemplateCategory } from "Board/Settings";
import { LanguagesDropdown } from "./LanguagesDropdown/LanguagesDropdown";
import { getCorrectEnding } from "shared/lib/getCorrectEnding";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal";

export const SELECT_TEMPLATE_MODAL = Symbol("selectTemplate");

export const SelectTemplateModal = (): JSX.Element => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [presentedTemplate, setPresentedTemplate] = useState<Template | null>(
		null,
	);
	const { isModalOpen } = useUiModalContext();
	const [selectedLanguage, setSelectedLanguage] = useState<string>(
		i18next.language,
	);
	const [selectedCategory, setSelectedCategory] =
		useState<TemplateCategory>("All templates");
	const [inputValue, setInputValue] = useState<string>("");
	const [isBurgerActive, setIsBurgerActive] = useState(false);

	useEffect(() => {
		if (isModalOpen(SELECT_TEMPLATE_MODAL)) {
			const tag =
				selectedCategory === "All templates"
					? undefined
					: selectedCategory;
			const term = inputValue || undefined;
			getTemplates({ language: selectedLanguage, tag, term }).then(
				templates => setTemplates(templates),
			);
		}
	}, [
		isModalOpen(SELECT_TEMPLATE_MODAL),
		selectedCategory,
		selectedLanguage,
		inputValue,
	]);

	const handleInputChange = useDebounce(
		(ev: React.ChangeEvent<HTMLInputElement>) =>
			setInputValue(ev.target.value),
	);

	const getTemplates = async ({
		term,
		language,
		tag,
	}: {
		term?: string;
		language: string;
		tag?: TemplateCategory;
	}) => {
		const params = new URLSearchParams(
			Object.entries({ term, language, tag }).filter(([_, v]) => v),
		);

		try {
			const response = await fetch(`${getApiUrl()}/templates?${params}`, {
				method: "GET",
			});
			return await response.json();
		} catch (error) {
			console.error(error);
			return [];
		}
	};

	const hideModalAndReset = () => {
		setSelectedCategory("All templates");
		setSelectedLanguage(i18next.language);
		setPresentedTemplate(null);
	};

	return (
		<UiModal
			modalId={SELECT_TEMPLATE_MODAL}
			wrClassName={styles.modal}
			className={styles.modalWr}
			onKeyDown={(ev: React.KeyboardEvent<HTMLDivElement>) =>
				ev.stopPropagation()
			}
			onClose={hideModalAndReset}
		>
			<div className={styles.wrapper}>
				<div className={styles.sidebar}>
					<div className={styles.sidebarHeader}>
						<Icon
							width={30}
							height={30}
							iconName="Template"
							className={styles.sidebarHeaderIcon}
						/>
						<h3>{t("modalTemplate.templates")}</h3>
					</div>
					<CategoriesMenu
						setSelectedCategory={setSelectedCategory}
						selectedCategory={selectedCategory}
					/>
				</div>
				<div className={styles.templatesContainer}>
					{presentedTemplate ? (
						<TemplateItemPreview
							name={presentedTemplate.name}
							language={presentedTemplate.lan}
							description={presentedTemplate.description}
							snapshot={presentedTemplate.snapshot}
							setPresentedTemplate={setPresentedTemplate}
							tags={presentedTemplate.tags}
							viewLinkId={presentedTemplate.uniqId}
							relatedTemplates={templates.filter(
								t => t.uniqId !== presentedTemplate.uniqId,
							)}
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
									placeholder={t(
										"modalTemplate.UI.inputs.search",
									)}
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
								<p>
									{inputValue
										? `${templates.length} \"${inputValue}\" ${t("modalTemplate.searchResults." + getCorrectEnding(templates.length))}`
										: t(
												`modalTemplate.category.useCaseItems.${selectedCategory}`,
											)}
								</p>
								<LanguagesDropdown
									setSelectedLanguage={setSelectedLanguage}
									selectedLanguage={selectedLanguage}
								/>
							</div>
							{templates.length ? (
								<TemplateItemsGrid
									templates={templates}
									setPresentedTemplate={setPresentedTemplate}
									className={styles.templatesGrid}
								/>
							) : (
								<p className={styles.noTemplatesText}>
									{t("modalTemplate.noTemplates")}
								</p>
							)}
						</>
					)}
				</div>
			</div>
		</UiModal>
	);
};
