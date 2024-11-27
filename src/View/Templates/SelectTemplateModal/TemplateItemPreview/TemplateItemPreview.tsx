import React from "react";
import { Button } from "../../../../shared/ui-lib/Button";
import { BoardSnapshot } from "../../../../Board/Board";
import { useAppContext } from "../../../AppContext";
import styles from "./TemplateItemPreview.module.css";
import { pasteSnapshot } from "../../../../utils";
import { Icon } from "../../../Icon";
import { TemplateItemsGrid } from "../TemplateItemsGrid/TemplateItemsGrid";
import { Template } from "../../../Tools/Template";
import { useModal } from "../../../Modal/ModalProvider";
import { useTranslation } from "react-i18next";

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
	const { hideModal } = useModal();
	const { t } = useTranslation();

	const pasteSnapshotAndClose = () => {
		setPresentedTemplate(null);
		hideModal("selectTemplate");
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
						src={`${window.location.origin}/boards/${viewLinkId}?userPanel=false`}
					></iframe>
					<div className={styles.infoBox}>
						<h2>{name}</h2>
						<p className={styles.description}>{description}</p>
						<Button
							pattern="quaternary"
							onClick={pasteSnapshotAndClose}
						>
							{t("modalTemplate.UI.buttons.Use")}
						</Button>
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
