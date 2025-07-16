import React from "react";
import styles from "./TemplateItemPreview.module.css";
import { TemplateItemsGrid } from "../TemplateItemsGrid/TemplateItemsGrid";
import { Template } from "microboard-temp";
import type { BoardSnapshot } from "microboard-temp";
import { useTranslation } from "react-i18next";
import { pasteSnapshot } from "features/Templates/lib";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { useUiModalContext } from "shared/ui-lib/UiModal";

interface TemplateItemPreviewProps {
  name: string;
  language: string;
  description: string;
  tags: string[];
  snapshot: BoardSnapshot;
  setPresentedTemplate: (template: null | Template) => void;
  viewLinkId: string;
  relatedTemplates: Template[];
}

export const TemplateItemPreview = ({
  name,
  description,
  snapshot,
  setPresentedTemplate,
  viewLinkId,
  relatedTemplates,
}: TemplateItemPreviewProps) => {
  const { board } = useAppContext();
  const { closeModal } = useUiModalContext();
  const { t } = useTranslation();

  const pasteSnapshotAndClose = () => {
    setPresentedTemplate(null);
    closeModal();
    pasteSnapshot({ board, snapshot });
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
          <iframe
            className={styles.frame}
            src={`${window.location.origin}/${viewLinkId}&userPanel=false&titlePanel=false&isTemplateView=true`}
          ></iframe>
          <div className={styles.infoBox}>
            <h2>{name}</h2>
            <p className={styles.description}>{description}</p>
            <UiButton onClick={pasteSnapshotAndClose} size="lg">
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
