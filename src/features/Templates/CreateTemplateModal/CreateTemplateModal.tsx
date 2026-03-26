import React, { ChangeEventHandler, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "shared/ui-lib/Input/Input";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import styles from "./CreateTemplateModal.module.css";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import { notify } from "shared/ui-lib/Toast/notify";
import { Selector, type SelectorHandle } from "shared/ui-lib/Selector";
import { UiModal } from "shared/ui-lib/UiModal/UiModal";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";

type TemplateLanguageOption = {
  value: string;
  label: React.ReactNode;
};

export const CREATE_TEMPLATE_MODAL = Symbol("createTemplate");

export const CreateTemplateModal = (): React.JSX.Element => {
  const formRef = useRef<HTMLFormElement>(null);
  const categoriesSelectorRef = useRef<SelectorHandle<true>>(null);
  const languagesSelectorRef = useRef<SelectorHandle<true>>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const { t } = useTranslation();
  const { board } = useAppContext();
  const { closeModal } = useUiModalContext();
  const forceUpdate = useForceUpdate();

  const categories = window.MICROBOARD_CONFIG.TEMPLATE_CATEGORIES.map(
    (category) => {
      return {
        value: category,
        label: String(
          t(`modalTemplate.category.useCaseItems.${category}` as never),
        ),
      };
    },
  );

  const selectedLanguages = languagesSelectorRef.current
    ?.getSelectedOptions()
    .map((o) => o.value) || [
    window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES[0].value,
  ];

  const hideModalAndResetForm = () => {
    formRef.current?.reset();
    categoriesSelectorRef.current?.setSelectedOptions([categories[0]]);
    languagesSelectorRef.current?.setSelectedOptions([
      window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES[0],
    ]);
    setPreviewFile(null);
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
  };

  const handleChangeImageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setErrors([]);

    const form = formRef.current;
    if (!form) return setErrors(["Unexpected error"]);
    if (!previewFile) return setErrors(["Please select a preview image"]);

    const multilanguageName: Record<string, string> = {};
    const multilanguageDescription: Record<string, string> = {};

    selectedLanguages.forEach((lang) => {
      multilanguageName[lang] =
        (form[`name_${lang}`] as HTMLInputElement)?.value || "";
      multilanguageDescription[lang] =
        (form[`description_${lang}`] as HTMLInputElement)?.value || "";
    });

    const tags = categoriesSelectorRef
      .current!.getSelectedOptions()
      .map((o) => o.value);

    setSubmitDisabled(true);

    try {
      const templateId = uuidv4();
      const snapshot = board.getSnapshot();

      const metadata = {
        id: templateId,
        name: multilanguageName,
        description: multilanguageDescription,
        languages: selectedLanguages,
        tags,
        preview: `templates/${templateId}/preview.png`,
        created: new Date().toISOString(),
      };

      const zip = new JSZip();
      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      zip.file("snapshot.json", JSON.stringify(snapshot, null, 2));
      zip.file("preview.png", previewFile);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `template_${templateId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify({
        body: t("template.createSuccess", "Template exported successfully"),
        variant: "info",
        duration: 3000,
      });

      hideModalAndResetForm();
      closeModal();
    } catch (err) {
      console.error(err);
      setErrors(["Failed to export template"]);
    } finally {
      setSubmitDisabled(false);
    }
  };

  return (
    <UiModal
      modalId={CREATE_TEMPLATE_MODAL}
      onClose={hideModalAndResetForm}
      onKeyDown={(ev) => ev.stopPropagation()}
      className={styles.wr}
      wrClassName={styles.modal}
      closeOnClickOutside={false}
    >
      <form
        id="export-template-form"
        onSubmit={onSubmit}
        ref={formRef}
        className={styles.form}
      >
        <h1>{t("modalTemplate.createTemplate", "Export Template")}</h1>
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
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
        />
        <UiButton
          variant="primary"
          disabled={submitDisabled}
          onClick={handleChangeImageClick}
          className={styles.btn}
          size="lg"
        >
          {previewFile
            ? t("modalTemplate.UI.buttons.previewChosen", "Preview Selected")
            : t(
                "modalTemplate.UI.buttons.choosePreview",
                "Choose Preview Image",
              )}
        </UiButton>
        <Selector
          multiselect={true}
          options={
            window.MICROBOARD_CONFIG.TEMPLATE_LANGUAGES.map((item) => ({
              ...item,
              label: String(t(`common.languages.${item.value}` as never)),
            })) as TemplateLanguageOption[]
          }
          ref={languagesSelectorRef}
          onChange={forceUpdate}
          containerClassName={styles.languagesSelector}
        />

        {selectedLanguages.map((lang) => (
          <div
            key={lang}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <Input
              id={`name_${lang}`}
              placeholder={`${t("modalTemplate.UI.inputs.name")} (${lang})`}
              label={`${t("modalTemplate.UI.inputs.name")} (${lang})`}
            />
            <Input
              id={`description_${lang}`}
              placeholder={`${t("modalTemplate.UI.inputs.description")} (${lang})`}
              label={`${t("modalTemplate.UI.inputs.description")} (${lang})`}
            />
          </div>
        ))}

        <UiButton
          variant="primary"
          className={styles.btn}
          type="submit"
          disabled={submitDisabled}
          size="lg"
        >
          {t("modalTemplate.UI.buttons.save", "Export as .zip")}
        </UiButton>
        {errors.length > 0 && <p className={styles.errorText}>{errors[0]}</p>}
      </form>
    </UiModal>
  );
};
