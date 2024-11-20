import { Modal } from "shared/ui-lib/Modal";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SelectTemplateModal.module.css";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import { TemplateItemPreview } from "./TemplateItemPreview/TemplateItemPreview";
import { getApiUrl } from "Config";
import { Icon } from "../../Icon";
import { Input } from "shared/ui-lib/Input/Input";
import clsx from "clsx";
import { CategoriesMenu } from "./CategoriesMenu/CategoriesMenu";
import i18next from "i18next";
import { useDebounce } from "shared/hooks/useDebounce";
import { TemplateItemsGrid } from "./TemplateItemsGrid/TemplateItemsGrid";
import { Template, TemplateCategory } from "View/Tools/Template";
import { LanguagesDropdown } from "./LanguagesDropdown/LanguagesDropdown";
import { useModal } from "View/Modal/ModalProvider";
import { getCorrectEnding } from "utils";

export const SelectTemplateModal = (): JSX.Element => {
	const { t } = useTranslation();
	const [templates, setTemplates] = useState<Template[]>([]);
	const [presentedTemplate, setPresentedTemplate] = useState<Template | null>(
		null,
	);
	const { hideModal, isModalOpen } = useModal();
	const [selectedLanguage, setSelectedLanguage] = useState<string>(
		i18next.language,
	);
	const [selectedCategory, setSelectedCategory] =
		useState<TemplateCategory>("All templates");
	const [inputValue, setInputValue] = useState<string>("");
	const [isBurgerActive, setIsBurgerActive] = useState(false);

	useEffect(() => {
		if (isModalOpen("selectTemplate")) {
			const tag =
				selectedCategory === "All templates"
					? undefined
					: selectedCategory;
			const term = inputValue || undefined;
			geTemplates({ language: selectedLanguage, tag, term }).then(
				templates => setTemplates(templates),
			);
		}
	}, [
		isModalOpen("selectTemplate"),
		selectedCategory,
		selectedLanguage,
		inputValue,
	]);

	const handleInputChange = useDebounce(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setInputValue(e.target.value),
	);

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
			`${getApiUrl()}/templates${
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

	const hideModalAndReset = () => {
		setSelectedCategory("All templates");
		setSelectedLanguage(i18next.language);
		setPresentedTemplate(null);
		hideModal("selectTemplate");
	};

	return (
		<Modal
			isOpen={isModalOpen("selectTemplate")}
			hideModal={hideModalAndReset}
			size={ModalSize.M}
			wrClassName={styles.modal}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
			modalName="selectTemplate"
		>
			<div className={styles.wrapper}>
				<div className={styles.sidebar}>
					<div className={styles.sidebarHeader}>
						<Icon width={30} height={30} iconName="Template" />
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
		</Modal>
	);
};
