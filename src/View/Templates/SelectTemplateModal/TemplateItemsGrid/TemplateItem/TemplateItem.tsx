import React from "react";
import styles from "./templateItem.module.css";
import { Button } from "shared/ui-lib/Button/Button";
import { useAppContext } from "View/AppContext";
import { pasteSnapshot } from "utils";
import { Template } from "View/Tools/Template";
import { useModal } from "View/Modal/ModalProvider";
import PlaceholderImg from "shared/assets/imgs/no-img-icon.svg";
import clsx from "clsx";
import {useTranslation} from "react-i18next";

interface TemplateItemProps {
	template: Template;
	setPresentedTemplate: (template: null | Template) => void;
}

export const TemplateItem = ({
	template,
	setPresentedTemplate,
}: TemplateItemProps) => {
	const { board } = useAppContext();
	const { hideModal } = useModal();
	const {t} = useTranslation()

	const pasteSnapshotAndClose = () => {
		setPresentedTemplate(null);
		hideModal("selectTemplate");
		pasteSnapshot({ board, snapshot: template.snapshot });
	};

	return (
		<div className={styles.card}>
			<div className={styles.imageBox}>
				<img
					onClick={() => setPresentedTemplate(template)}
					className={clsx(styles.image, !template.preview && styles.noImage)}
					src={template.preview || PlaceholderImg}
					alt={template.name}
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
