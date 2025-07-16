import React, { SyntheticEvent, useState, useRef } from "react";
import styles from "./templateItem.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Template } from "microboard-temp";
import PlaceholderImg from "shared/assets/imgs/no-img-icon.svg";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { pasteSnapshot } from "features/Templates/lib";
import { useUiModalContext } from "shared/ui-lib/UiModal";

interface TemplateItemProps {
  template: Template;
  setPresentedTemplate: (template: null | Template) => void;
}

export const TemplateItem = ({
  template,
  setPresentedTemplate,
}: TemplateItemProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(!template.preview);
  const { board } = useAppContext();
  const { closeModal } = useUiModalContext();
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Состояние для отслеживания начала касания
  const [isTouchStart, setIsTouchStart] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setIsImageError(true);
  };

  const pasteSnapshotAndClose = () => {
    setPresentedTemplate(null);
    closeModal();
    pasteSnapshot({ board, snapshot: template.snapshot });
  };

  // Обрабатываем события касания для пропуска жестов скролла на родительский контейнер
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouchStart(true);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouchStart) {
      return;
    }

    // Вычисляем вертикальное смещение
    const touchY = e.touches[0].clientY;
    const deltaY = touchStartY - touchY;

    // Если обнаружен вертикальный скролл, предотвращаем обработку события карточкой
    if (Math.abs(deltaY) > 10) {
      e.stopPropagation();
    }
  };

  const handleTouchEnd = () => {
    setIsTouchStart(false);
  };

  return (
    <div
      className={styles.card}
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.imageBox}>
        <img
          onClick={() => setPresentedTemplate(template)}
          className={clsx(styles.image, isImageError && styles.noImage)}
          src={
            isLoading || isImageError
              ? PlaceholderImg
              : (template.preview as string) || ""
          }
          alt={template.name}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div
          className={styles.buttonsBox}
          onClick={() => setPresentedTemplate(template)}
        >
          <div>
            <UiButton
              onClick={() => setPresentedTemplate(template)}
              variant="tertiary"
              size="lg"
            >
              {t("modalTemplate.UI.buttons.Preview")}
            </UiButton>
            <UiButton onClick={pasteSnapshotAndClose} size="lg">
              {t("modalTemplate.UI.buttons.Use")}
            </UiButton>
          </div>
        </div>
      </div>
      <div className={styles.info}>
        <p>{template.name}</p>
      </div>
    </div>
  );
};
