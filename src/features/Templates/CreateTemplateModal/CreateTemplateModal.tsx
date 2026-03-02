import React, { ChangeEventHandler, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui-lib/Input/Input";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { useAccount } from "App/useAccount";
import { getApiUrl } from "Config";
import styles from "./CreateTemplateModal.module.css";
import { useTolgee } from "@tolgee/react";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { notify } from "shared/ui-lib/Toast/notify";
import { TolgeeProviderProvider } from "../TolgeeProvider";
import { getTolgeeApiUrl } from "features/Templates/config";
import { detectLanguage } from "../lib";
import { Selector, type SelectorHandle } from "shared/ui-lib/Selector";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";

interface TranslatableInput {
  id: string;
  placeholder: string;
  label?: string;
  defaultValue?: string;
}

export const CREATE_TEMPLATE_MODAL = Symbol("createTemplate");

const CreateTemplate = (): React.JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null);
  const categoriesSelectorRef = useRef<SelectorHandle<true>>(null);
  const languagesSelectorRef = useRef<SelectorHandle<true>>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
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
  const account = useAccount();
  const { closeModal } = useUiModalContext();
  const forceUpdate = useForceUpdate();

  const categories = window.MICROBOARD_CONFIG.TEMPLATE_CATEGORIES.map(
    (category) => {
      return {
        value: category,
        label: t(`modalTemplate.category.useCaseItems.${category}`),
      };
    },
  );

  const hideModalAndResetForm = () => {
    formRef.current?.reset();
    categoriesSelectorRef.current?.setSelectedOptions([categories[0]]);
    languagesSelectorRef.current?.setSelectedOptions([
      window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES[0],
    ]);
  };

  const getLanguages = async () => {
    try {
      const response = await fetch(getTolgeeApiUrl("/languages"), {
        method: "get",
        headers: {
          Accept: "application/json",
          "X-API-Key": import.meta.env.TOLGEE_API_KEY,
        },
      });
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
    return fetch(getTolgeeApiUrl("/suggest/machine-translations"), {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": import.meta.env.TOLGEE_API_KEY,
      },
      body: data,
    })
      .then((response) => response.json())
      .catch((error) => console.log(error));
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setErrors([]);
    setSubmitDisabled(true);

    try {
      const initResponse = await fetch(
        `${getApiUrl()}/templates/upload-preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${account.accessToken}`,
          },
          body: JSON.stringify({ fileSize: file.size, fileType: file.type }),
        },
      );
      if (!initResponse.ok) {
        setErrors(["Error while uploading image"]);
        return;
      }
      const { uploadUrl, previewKey: key } = await initResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadResponse.ok) {
        setErrors(["Error while uploading image"]);
        return;
      }
      setPreviewKey(key);
    } finally {
      setSubmitDisabled(false);
    }
  };

  async function createTemplate(body: any): Promise<string> {
    const boardId = board.getBoardId();
    const response = await fetch(`${getApiUrl()}/templates`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${account.accessToken}`,
      },
      body: JSON.stringify({ ...body, boardId }),
      redirect: "follow",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("conflict");
      }
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();
    return data.id as string;
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
    ev: React.MouseEvent<HTMLButtonElement>,
  ) => {
    ev.preventDefault();
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

    const getInputConfig = (type: string, finalLang = "") =>
      ({
        name: {
          label: `Template name ${finalLang}`,
          id: `templateName${finalLang}`,
        },
        description: {
          label: `Description ${finalLang}`,
          id: `description${finalLang}`,
        },
      })[type];

    const updateInputs = (language: string, type: "description" | "name") => {
      let targetLanguage = nameLanguage;
      translationData.baseText = name;
      if (type === "description") {
        targetLanguage = descriptionLanguage;
        translationData.baseText = description;
      }

      if (language !== targetLanguage) {
        const languageToTranslate = languages.find((lan) => {
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
        ).then((data) => {
          const finalLang =
            languageToTranslate.tag === targetLanguage
              ? tolgee.getLanguage()
              : languageToTranslate.tag;
          const defaultValue = data.result.TOLGEE.output as string;
          const config = getInputConfig(type, finalLang);
          if (config) {
            const newInput = {
              defaultValue,
              label: config.label,
              placeholder: config.label,
              id: config.id,
            };

            type === "name"
              ? setNameInputs((inputs) => [...inputs, newInput])
              : setDescriptionInputs((inputs) => [...inputs, newInput]);
          }
        });
        promises.push(res);
      }
    };

    for (const language of languagesSelectorRef
      .current!.getSelectedOptions()
      .map((o) => o.value)) {
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
      descriptionInputs.forEach((desc) => {
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
      nameInputs.forEach((name) => {
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
      .map((o) => o.value);

    setIsSubmitLoading(true);
    setSubmitDisabled(true);

    const body = {
      description: multilanguageDescription,
      languages: languagesSelectorRef
        .current!.getSelectedOptions()
        .map((o) => o.value),
      tags,
      name: multilanguageName,
      preview: previewKey,
    };

    await createTemplate(body)
      .then((templateId) => {
        localStorage.setItem(`templateId:${board.getBoardId()}`, templateId);
        formRef.current?.reset();
        categoriesSelectorRef.current?.setSelectedOptions([categories[0]]);
        languagesSelectorRef.current?.setSelectedOptions([
          window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES[0],
        ]);
        setPreviewKey(null);
        notify({
          body: t("template.createSuccess"),
          variant: "info",
          duration: 3000,
        });
        setSubmitDisabled(false);
        setIsSubmitLoading(false);
        closeModal();
      })
      .catch((err) => {
        if (err?.message === "conflict") {
          setErrors([
            t("template.alreadyExists" as any) ||
              "Template for this board already exists",
          ]);
        } else {
          setErrors([t("template.createError")]);
        }
      })
      .finally(() => {
        setSubmitDisabled(false);
        setIsSubmitLoading(false);
      });
  };

  const tolgeeConfigured = Boolean(
    import.meta.env.TOLGEE_API_URL && import.meta.env.TOLGEE_API_KEY,
  );

  return (
    <UiModal
      modalId={CREATE_TEMPLATE_MODAL}
      onClose={hideModalAndResetForm}
      onKeyDown={(ev: React.KeyboardEvent<HTMLDivElement>) =>
        ev.stopPropagation()
      }
      className={styles.wr}
      wrClassName={styles.modal}
      closeOnClickOutside={false}
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
        <UiButton
          variant="primary"
          disabled={submitDisabled}
          onClick={handleChangeImageClick}
          className={styles.btn}
          size="lg"
        >
          {t(
            `modalTemplate.UI.buttons.${previewKey ? "previewChosen" : "choosePreview"}`,
          )}
        </UiButton>
        <Selector
          multiselect={true}
          options={window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES.map((item) => {
            item.label = t(`common.languages.${item.value}`);
            return item;
          })}
          ref={languagesSelectorRef}
          onChange={forceUpdate}
          containerClassName={styles.languagesSelector}
        />
        {nameInputs.map((input) => {
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
        {descriptionInputs.map((input) => {
          return (
            <Input
              id={input.id}
              defaultValue={input.defaultValue}
              placeholder={t("modalTemplate.UI.inputs.description")}
              label={input.label}
              key={input.id}
            />
          );
        })}
        {tolgeeConfigured &&
          languagesSelectorRef.current &&
          languagesSelectorRef.current.getSelectedOptions().length > 1 && (
            <UiButton
              variant="primary"
              className={styles.btn}
              disabled={submitDisabled || translateDisabled}
              onClick={handleTranslateClick}
              size="lg"
            >
              {t("modalTemplate.UI.buttons.translate")}
            </UiButton>
          )}
        <UiButton
          variant="primary"
          className={styles.btn}
          type="submit"
          disabled={submitDisabled && translateDisabled}
          loading={isSubmitLoading}
          size="lg"
        >
          {t("modalTemplate.UI.buttons.save")}
        </UiButton>
        {errors.length > 0 && <p className={styles.errorText}>{errors[0]}</p>}
      </form>
    </UiModal>
  );
};

export const CreateTemplateModal = () => {
  return (
    <TolgeeProviderProvider>
      <CreateTemplate />
    </TolgeeProviderProvider>
  );
};
