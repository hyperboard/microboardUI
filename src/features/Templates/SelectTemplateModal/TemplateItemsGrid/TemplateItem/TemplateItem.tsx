import React, { SyntheticEvent, useState } from "react";
import styles from "./templateItem.module.css";
import { Button } from "shared/ui-lib/Button/Button";
import { useAppContext } from "features/AppContext";
import { Template } from "Board/Settings";
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

	return (
		<div className={styles.card}>
			<div className={styles.imageBox}>
				<img
					onClick={() => setPresentedTemplate(template)}
					className={clsx(
						styles.image,
						isImageError && styles.noImage,
					)}
					src={
						isLoading || isImageError
							? PlaceholderImg
							: template.preview
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
						<Button
							onClick={() => setPresentedTemplate(template)}
							pattern="tertiary"
						>
							{t("modalTemplate.UI.buttons.Preview")}
						</Button>
						<Button
							onClick={pasteSnapshotAndClose}
							pattern="quaternary"
						>
							{t("modalTemplate.UI.buttons.Use")}
						</Button>
					</div>
				</div>
			</div>
			<div className={styles.info}>
				<p>{template.name}</p>
			</div>
		</div>
	);
};
