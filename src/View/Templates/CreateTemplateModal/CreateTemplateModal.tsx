import { Modal } from "shared/ui-lib/Modal";
import React, { ChangeEventHandler, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui-lib/Input/Input";
import { Button } from "shared/ui-lib/Button/Button";
import { useAppContext } from "View/AppContext";
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import styles from "./CreateTemplateModal.module.css";
import { CATEGORIES, LANGUAGES } from "View/Tools/Template";
import { useTolgee } from "@tolgee/react";
import { detectLanguage } from "utils";
import { useModal } from "View/Modal/ModalProvider";
import Selector, { SelectorHandle } from "../../Ui/Selector/Selector";
import { useForceUpdate } from "lib/useForceUpdate";
import { notify } from "View/Ui/Toast/notify";
import { TolgeeProviderProvider } from "../TolgeeProvider.tsx";

interface TranslatableInput {
	id: string;
	placeholder: string;
	label?: string;
	defaultValue?: string;
}

const CreateTemplate = (): JSX.Element => {
	const formRef = useRef<HTMLFormElement>(null);
	const categoriesSelectorRef = useRef<SelectorHandle<true>>(null);
	const languagesSelectorRef = useRef<SelectorHandle<true>>(null);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
	const [translateDisabled, setTranslateDisabled] = useState<boolean>(false);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [nameInputs, setNameInputs] = useState<TranslatableInput[]>([
		{ id: "templateName", placeholder: "Template name" },
	]);
	const [descriptionInputs, setDescriptionInputs] = useState<
		TranslatableInput[]
	>([{ id: "description", placeholder: "Description" }]);
	const { t } = useTranslation();
	const { board } = useAppContext();
	const { isModalOpen, hideModal } = useModal();
	const forceUpdate = useForceUpdate();

	const categories = CATEGORIES.map(category => {
		return {
			value: category,
			label: t(`modalTemplate.category.useCaseItems.${category}`),
		};
	});

	const hideModalAndResetForm = () => {
		formRef.current?.reset();
		categoriesSelectorRef.current?.setSelectedOptions([categories[0]]);
		languagesSelectorRef.current?.setSelectedOptions([LANGUAGES[0]]);
		hideModal("createTemplate");
	};

	const getLanguages = async () => {
		const requestOptions = {
			method: "get",
			maxBodyLength: Infinity,
			headers: {
				Accept: "application/json",
				"X-API-Key": import.meta.env.TOLGEE_API_KEY,
			},
		};
		try {
			const response = await fetch(
				`${import.meta.env.TOLGEE_API_URL}/v2/projects/${import.meta.env.TOLGEE_PROJECT_ID}/languages`,
				requestOptions,
			);
			return (await response.json())._embedded.languages as {
				id: number;
				name: string;
				tag: string;
				originalName: string;
			}[];
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	const createTranslationRequest = async (data: string) => {
		const requestOptions = {
			method: "post",
			maxBodyLength: Infinity,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				"X-API-Key": import.meta.env.TOLGEE_API_KEY,
			},
			body: data,
		};
		try {
			const response = await fetch(
				`${import.meta.env.TOLGEE_API_URL}/v2/projects/${import.meta.env.TOLGEE_PROJECT_ID}/suggest/machine-translations`,
				requestOptions,
			);
			return await response.json();
		} catch (error) {
			console.log(error);
		}
	};

	const handleFileChange: ChangeEventHandler<HTMLInputElement> = e => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) {
			return;
		}

		const headers = new Headers();
		headers.append("content-type", "image/png");
		headers.append("x-image-id", Date.now().toString());

		const requestOptions = {
			method: "POST",
			headers,
			body: file,
		};

		setSubmitDisabled(true);

		fetch(getApiUrl("/media"), requestOptions)
			.then(response => response.json())
			.then(result => {
				setImageSrc(result.src);
			})
			.finally(() => setSubmitDisabled(false));
	};

	async function createTemplate(body: string) {
		const response = await fetch(
			`${getApiUrl()}/templates/${board.getBoardId()}`,
			{
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${Cookies.get("accessToken")}`,
				},
				body,
				redirect: "follow",
				referrerPolicy: "no-referrer",
			},
		);
		if (!response.ok) {
			throw new Error("response not OK");
		}
	}

	const tolgee = useTolgee();

	const handleChangeImageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.click();
	};

	const handleTranslateClick = async (
		e: React.MouseEvent<HTMLButtonElement>,
	) => {
		e.preventDefault();
		setTranslateDisabled(true);
		const languages = await getLanguages();
		if (!languages) {
			return setErrors(["Cant get languages to translate"]);
		}

		const form = formRef.current;
		const description = form?.description.value as string;
		const name = form?.templateName.value as string;
		const nameLanguage = detectLanguage(name);
		const descriptionLanguage = detectLanguage(description);

		const translationData = {
			targetLanguageId: 0,
			baseText: "",
			isPlural: false,
			services: ["TOLGEE"],
		};

		const promises: Promise<void>[] = [];

		const updateInputs = (
			language: string,
			type: "description" | "name",
		) => {
			let targetLanguage = nameLanguage;
			translationData.baseText = name;
			if (type === "description") {
				targetLanguage = descriptionLanguage;
				translationData.baseText = description;
			}
			console.log(language, targetLanguage);
			if (language !== targetLanguage) {
				const languageToTranslate = languages.find(lan => {
					return language === tolgee.getLanguage()
						? lan.tag === targetLanguage
						: lan.tag === language;
				});
				if (!languageToTranslate) {
					return;
				}
				translationData.targetLanguageId = languageToTranslate.id;

				const res = createTranslationRequest(
					JSON.stringify(translationData),
				).then(data => {
					const finalLang =
						languageToTranslate.tag === targetLanguage
							? tolgee.getLanguage()
							: languageToTranslate.tag;
					const defaultValue = data.result.TOLGEE.output as string;
					let label: string = "";
					if (type === "name") {
						label = `Template name ${finalLang}`;
						setNameInputs([
							...nameInputs,
							{
								defaultValue,
								label,
								placeholder: label,
								id: `templateName${finalLang}`,
							},
						]);
					} else if (type === "description") {
						label = `Description ${finalLang}`;
						setDescriptionInputs([
							...descriptionInputs,
							{
								defaultValue,
								label,
								placeholder: label,
								id: `description${finalLang}`,
							},
						]);
					}
				});
				promises.push(res);
			}
		};

		for (const language of languagesSelectorRef
			.current!.getSelectedOptions()
			.map(o => o.value)) {
			updateInputs(language, "name");
			updateInputs(language, "description");
		}
		Promise.all(promises).finally(() => {
			setSubmitDisabled(false);
		});
	};

	const onSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		event.preventDefault();
		setErrors([]);

		const form = formRef.current;
		if (!form) {
			return setErrors(["Unexpeced error"]);
		}
		const multilanguageDescription: Record<string, string> = {};
		const multilanguageName: Record<string, string> = {};
		if (descriptionInputs.length === 1) {
			multilanguageDescription[
				languagesSelectorRef.current!.getSelectedOptions()[0].value
			] = form?.description.value;
		} else {
			descriptionInputs.forEach(desc => {
				const value = form[desc.id].value as string;
				let language = desc.id.split("description")[1];
				if (!language) {
					language = detectLanguage(value);
				}

				multilanguageDescription[language] = value;
			});
		}
		if (nameInputs.length === 1) {
			multilanguageName[
				languagesSelectorRef.current!.getSelectedOptions()[0].value
			] = form?.templateName.value;
		} else {
			nameInputs.forEach(name => {
				const value = form[name.id].value as string;
				let language = name.id.split("templateName")[1];
				if (!language) {
					language = detectLanguage(value);
				}

				multilanguageName[language] = value;
			});
		}
		const tags = categoriesSelectorRef
			.current!.getSelectedOptions()
			.map(o => o.value);
		const snapshot = board.getSnapshot();

		setIsSubmitLoading(true);
		setSubmitDisabled(true);

		const body = JSON.stringify({
			description: multilanguageDescription,
			languages: languagesSelectorRef
				.current!.getSelectedOptions()
				.map(o => o.value),
			tags,
			snapshot,
			name: multilanguageName,
			preview: imageSrc,
		});

		await createTemplate(body)
			.then(res => {
				formRef.current?.reset();
				categoriesSelectorRef.current?.setSelectedOptions([
					categories[0],
				]);
				languagesSelectorRef.current?.setSelectedOptions([
					LANGUAGES[0],
				]);
				notify({
					body: t("template.createSuccess"),
					variant: "info",
					duration: 3000,
				});
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
				hideModal("createTemplate");
			})
			.catch(() => {
				setErrors([t("template.createError")]);
			})
			.finally(() => {
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	return (
		<Modal
			isOpen={isModalOpen("createTemplate")}
			hideModal={hideModalAndResetForm}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
			modalName="createTemplate"
		>
			<form
				id="create-template-form"
				onSubmit={onSubmit}
				ref={formRef}
				className={styles.form}
			>
				<h1>{t("modalTemplate.createTemplate")}</h1>
				<Selector
					multiselect={true}
					options={categories}
					ref={categoriesSelectorRef}
					containerClassName={styles.categoriesSelector}
				/>
				<input
					ref={inputRef}
					onChange={handleFileChange}
					type="file"
					style={{ display: "none" }}
				/>
				<Button onClick={handleChangeImageClick}>
					{t(
						`modalTemplate.UI.buttons.${imageSrc ? "previewChosen" : "choosePreview"}`,
					)}
				</Button>
				<Selector
					multiselect={true}
					options={LANGUAGES.map(item => {
						item.label = t(`common.languages.${item.value}`);
						return item;
					})}
					ref={languagesSelectorRef}
					onChange={forceUpdate}
					containerClassName={styles.languagesSelector}
				/>
				{nameInputs.map(input => {
					return (
						<Input
							id={input.id}
							defaultValue={input.defaultValue}
							placeholder={t("modalTemplate.UI.inputs.name")}
							label={input.label}
							key={input.id}
						/>
					);
				})}
				{descriptionInputs.map(input => {
					return (
						<Input
							id={input.id}
							defaultValue={input.defaultValue}
							placeholder={t(
								"modalTemplate.UI.inputs.description",
							)}
							label={input.label}
							key={input.id}
						/>
					);
				})}
				{languagesSelectorRef.current &&
					languagesSelectorRef.current.getSelectedOptions().length >
						1 && (
						<Button
							disabled={submitDisabled || translateDisabled}
							onClick={handleTranslateClick}
						>
							{t("modalTemplate.UI.buttons.translate")}
						</Button>
					)}
				<Button
					type="submit"
					disabled={submitDisabled && translateDisabled}
					loading={isSubmitLoading}
				>
					{t("modalTemplate.UI.buttons.save")}
				</Button>
				{errors.length ? (
					<p className={styles.errorText}>{errors[0]}</p>
				) : undefined}
			</form>
		</Modal>
	);
};

export const CreateTemplateModal = () => {
	return (
		<TolgeeProviderProvider>
			<CreateTemplate />
		</TolgeeProviderProvider>
	);
};
