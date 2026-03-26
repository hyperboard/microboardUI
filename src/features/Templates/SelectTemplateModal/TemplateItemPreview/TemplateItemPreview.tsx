import React, { useState } from "react";
import styles from "./TemplateItemPreview.module.css";
import { TemplateItemsGrid } from "../TemplateItemsGrid/TemplateItemsGrid";
import { Template } from "features/Templates/types";
import { useTranslation } from "react-i18next";
import { fetchTemplateSnapshot, pasteSnapshot } from "features/Templates/lib";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { useUiModalContext } from "shared/ui-lib/UiModal";

interface TemplateItemPreviewProps {
  name: string;
  templateId: string;
  preview: string;
  setPresentedTemplate: (template: null | Template) => void;
  relatedTemplates: Template[];
}

export const TemplateItemPreview = ({
  name,
  templateId,
  preview,
  setPresentedTemplate,
  relatedTemplates,
}: TemplateItemPreviewProps) => {
  const { board } = useAppContext();
  const { closeModal } = useUiModalContext();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const pasteSnapshotAndClose = async () => {
    setIsLoading(true);
    try {
      const snapshot = await fetchTemplateSnapshot(templateId, i18n.language);
      setPresentedTemplate(null);
      closeModal();
      pasteSnapshot({ board, snapshot });
    } catch (error) {
      console.error("Failed to load template snapshot:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => setPresentedTemplate(null)}
        >
          <Icon iconName="BackArrow" width={14} height={14} />
          {t("modalTemplate.backToTemplates")}
        </button>
      </div>
      <div className={styles.scrollContainer}>
        <div className={styles.mainSection}>
          <img
            className={styles.frame}
            src={preview}
            alt={name}
            style={{ objectFit: "contain", backgroundColor: "#f0f0f0" }}
          />
          <div className={styles.infoBox}>
            <h2>{name}</h2>
            <UiButton
              onClick={pasteSnapshotAndClose}
              size="lg"
              loading={isLoading}
            >
              {t("modalTemplate.UI.buttons.Use")}
            </UiButton>
          </div>
        </div>
        <h3 className={styles.relatedTemplatesHeader}>
          {t("modalTemplate.relatedTemplates")}
        </h3>
        <TemplateItemsGrid
          templates={relatedTemplates}
          setPresentedTemplate={setPresentedTemplate}
        />
      </div>
    </div>
  );
};
