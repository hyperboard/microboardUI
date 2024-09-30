import { Modal } from "shared/ui-lib/Modal";
import React, {
	ChangeEventHandler,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../shared/ui-lib/Input";
import { Button } from "../../../shared/ui-lib/Button";
import { useAppContext } from "../../AppContext";
import { getApiUrl } from "../../../Config";
import Cookies from "js-cookie";
import styles from "./CreateTemplateModal.module.css";
import { TemplateCategory } from "../types";
import { Dropdown } from "../../../shared/ui-lib/Dropdown/Dropdown";
import i18next from "i18next";
import { useTolgee, useTranslate } from "@tolgee/react";
import { detectLanguage } from "../../../utils";

interface CreateTemplateModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

interface TranslatableInput {
	id: string;
	placeholder: string;
	label?: string;
	defaultValue?: string;
}

const CATEGORIES: TemplateCategory[] = [
	"Research & Analysis",
	"Diagramming",
	"Meeting & Workshop",
	"Strategy & Planning",
	"Brainstorming",
	"Agile Workflow",
	"Icebreaker & Game",
	"Education",
];

export const CreateTemplateModal = ({
	isOpen,
	setIsOpen,
}: CreateTemplateModalProps): JSX.Element => {
	const formRef = useRef<HTMLFormElement>(null);
	const imageSrc = useRef<null | string>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
	const [translateDisabled, setTranslateDisabled] = useState<boolean>(false);
	const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<
		TemplateCategory[]
	>([]);
	const [nameInputs, setNameInputs] = useState<TranslatableInput[]>([
		{ id: "templateName", placeholder: "Template name" },
	]);
	const [descriptionInputs, setDescriptionInputs] = useState<
		TranslatableInput[]
	>([{ id: "description", placeholder: "Description" }]);
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
		i18next.language,
	]);
	const { t } = useTranslation();
	const { board } = useAppContext();

	const TOLGEE_API_KEY =
		import.meta.env.TOLGEE_API_KEY ||
		"tgpak_geydamzsl53gs4tbgbyw6ndfg5zwizdpnu2gqmlun4zggy3sgzya";
	const TOLGEE_API_URL =
		import.meta.env.TOLGEE_API_URL || "https://app.tolgee.io";
	const TOLGEE_PROJECT_ID = import.meta.env.TOLGEE_PROJECT_ID || "10032";

	useEffect(() => {
		return () => {
			formRef.current?.reset();
		};
	}, []);

	const getLanguages = async () => {
		const requestOptions = {
			method: "get",
			maxBodyLength: Infinity,
			headers: {
				Accept: "application/json",
				"X-API-Key": TOLGEE_API_KEY,
			},
		};
		try {
			const response = await fetch(
				`${TOLGEE_API_URL}/v2/projects/${TOLGEE_PROJECT_ID}/languages`,
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
				"X-API-Key": TOLGEE_API_KEY,
			},
			body: data,
		};
		try {
			const response = await fetch(
				`${TOLGEE_API_URL}/v2/projects/${TOLGEE_PROJECT_ID}/suggest/machine-translations`,
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
				imageSrc.current = result.src;
			})
			.finally(() => setSubmitDisabled(false));
	};

	const handleChangeImageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.click();
	};

	async function createTemplate(body: string) {
		const response = await fetch(
			`${getApiUrl()}/boards/${board.getBoardId()}/template`,
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

		for (const language of selectedLanguages) {
			if (language !== nameLanguage) {
				const languageToTranslate = languages.find(lan => {
					return language === tolgee.getLanguage()
						? lan.tag === nameLanguage
						: lan.tag === language;
				});
				if (!languageToTranslate) {
					return;
				}
				translationData.targetLanguageId = languageToTranslate.id;
				translationData.baseText = name;
				const res = createTranslationRequest(
					JSON.stringify(translationData),
				).then(data => {
					const finalLang =
						languageToTranslate.tag === nameLanguage
							? tolgee.getLanguage()
							: languageToTranslate.tag;
					const defaultValue = data.result.TOLGEE.output as string;
					const label = `Template name ${finalLang}`;
					setNameInputs([
						...nameInputs,
						{
							defaultValue,
							label,
							placeholder: label,
							id: `templateName${finalLang}`,
						},
					]);
				});
				promises.push(res);
			}
			if (language !== descriptionLanguage) {
				const languageToTranslate = languages.find(lan => {
					return language === tolgee.getLanguage()
						? lan.tag === descriptionLanguage
						: lan.tag === language;
				});
				if (!languageToTranslate) {
					return;
				}
				translationData.targetLanguageId = languageToTranslate.id;
				translationData.baseText = description;
				const res = createTranslationRequest(
					JSON.stringify(translationData),
				).then(data => {
					const finalLang =
						languageToTranslate.tag === descriptionLanguage
							? tolgee.getLanguage()
							: languageToTranslate.tag;
					const defaultValue = data.result.TOLGEE.output as string;
					const label = `Description ${finalLang}`;
					setDescriptionInputs([
						...descriptionInputs,
						{
							defaultValue,
							label,
							placeholder: label,
							id: `description${finalLang}`,
						},
					]);
				});
				promises.push(res);
			}
		}
		Promise.all(promises).finally(() => {
			setNameInputs(prevState => {
				prevState[0] = {
					id: "templateName" + nameLanguage,
					placeholder: prevState[0].placeholder,
					defaultValue: formRef.current[prevState[0].id].value,
				};
				return prevState;
			});
			setDescriptionInputs(prevState => {
				prevState[0] = {
					id: "description" + descriptionLanguage,
					placeholder: prevState[0].placeholder,
					defaultValue: formRef.current[prevState[0].id].value,
				};
				return prevState;
			});
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
			return setErrors(["Unexpeced error, no form ref"]);
		}
		const multilanguageDescription: Record<string, string> = {};
		const multilanguageName: Record<string, string> = {};
		if (descriptionInputs.length === 1) {
			multilanguageDescription[selectedLanguages[0]] =
				form?.description.value;
		} else {
			descriptionInputs.forEach(desc => {
				console.log(desc.id);
				const value = form[desc.id].value as string;
				multilanguageDescription[desc.id.split("description")[1]] =
					value;
			});
		}
		if (nameInputs.length === 1) {
			multilanguageName[selectedLanguages[0]] = form?.templateName.value;
		} else {
			nameInputs.forEach(name => {
				const value = form[name.id].value as string;
				multilanguageName[name.id.split("templateName")[1]] = value;
			});
		}
		let tags = selectedCategories;
		const snapshot = board.getSnapshot();

		setIsSubmitLoading(true);
		setSubmitDisabled(true);

		const body = JSON.stringify({
			description: multilanguageDescription,
			languages: selectedLanguages,
			tags,
			snapshot,
			name: multilanguageName,
			preview: imageSrc.current,
		});

		await createTemplate(body)
			.then(res => {
				formRef.current?.reset();
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
				setIsOpen(false);
			})
			.catch(() => {
				setErrors(["Error while creating template"]);
			})
			.finally(() => {
				setSubmitDisabled(false);
				setIsSubmitLoading(false);
			});
	};

	const handleSelectLanguage = (lan: string) => {
		if (selectedLanguages.includes(lan)) {
			return setSelectedLanguages(
				selectedLanguages.filter(language => language !== lan),
			);
		}
		setSelectedLanguages([...selectedLanguages, lan]);
	};

	const handleSelectCategory = (category: TemplateCategory) => {
		if (selectedCategories.includes(category)) {
			return setSelectedCategories(
				selectedCategories.filter(selected => selected !== category),
			);
		}
		setSelectedCategories([...selectedCategories, category]);
	};

	const categoriesDropdownItems = CATEGORIES.map(category => {
		return (
			<p
				key={category}
				className={styles.dropdownItem}
				onClick={() => handleSelectCategory(category)}
			>
				{category}
			</p>
		);
	});

	const languagesDropdownItems = i18next.languages.map(lan => {
		return (
			<p
				key={lan}
				className={styles.dropdownItem}
				onClick={() => handleSelectLanguage(lan)}
			>
				{lan}
			</p>
		);
	});

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
				e.stopPropagation()
			}
		>
			<form
				id="create-template-form"
				onSubmit={onSubmit}
				ref={formRef}
				className={styles.form}
			>
				<h1>Create template</h1>
				<input
					ref={inputRef}
					onChange={handleFileChange}
					type="file"
					style={{ display: "none" }}
				/>
				<Button onClick={handleChangeImageClick}>Choose preview</Button>
				<Dropdown
					items={languagesDropdownItems}
					label={
						selectedLanguages.length
							? selectedLanguages.join(", ")
							: "none"
					}
				/>
				{nameInputs.map(input => {
					return (
						<Input
							id={input.id}
							defaultValue={input.defaultValue}
							placeholder={input.placeholder}
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
							placeholder={input.placeholder}
							label={input.label}
							key={input.id}
						/>
					);
				})}
				{selectedLanguages.length > 1 && (
					<Button
						disabled={submitDisabled || translateDisabled}
						onClick={handleTranslateClick}
					>
						Translate
					</Button>
				)}
				<Dropdown
					items={categoriesDropdownItems}
					label={
						selectedCategories.length
							? selectedCategories.join(", ")
							: "none"
					}
				/>
				<Button
					type="submit"
					disabled={submitDisabled && translateDisabled}
					loading={isSubmitLoading}
				>
					Save
				</Button>
				{errors.length ? (
					<p className={styles.errorText}>{errors[0]}</p>
				) : undefined}
			</form>
		</Modal>
	);
};
