import React from "react";
import { Button } from "../../../../shared/ui-lib/Button";
import { BoardSnapshot } from "../../../../Board/Board";
import { Template } from "../../types";
import { useAppContext } from "../../../AppContext";
import styles from "./TemplateItemPreview.module.css";
import { pasteSnapshot } from "../../../../utils";
import { Icon } from "../../../Icon";
import { TemplateItemsGrid } from "../TemplateItemsGrid/TemplateItemsGrid";

interface TemplateItemPreviewProps {
	name: string;
	language: string;
	description: string;
	tags: string[];
	snapshot: BoardSnapshot;
	setPresentedTemplate: (template: null | Template) => void;
	setIsOpen: (isOpen: boolean) => void;
	viewLinkId: string;
	relatedTemplates: Template[];
}

export const TemplateItemPreview = ({
	name,
	description,
	snapshot,
	setPresentedTemplate,
	setIsOpen,
	viewLinkId,
	relatedTemplates,
}: TemplateItemPreviewProps) => {
	const { board } = useAppContext();

	const pasteSnapshotAndClose = () => {
		setPresentedTemplate(null);
		setIsOpen(false);
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
					Back to template center
				</button>
			</div>
			<div className={styles.scrollContainer}>
				<div className={styles.mainSection}>
					<iframe
						className={styles.frame}
						src={`http://localhost:8000/boards/${viewLinkId}`}
					></iframe>
					<div className={styles.infoBox}>
						<h2>{name}</h2>
						<p>{description}</p>
						<Button
							pattern="quaternary"
							onClick={pasteSnapshotAndClose}
						>
							Use
						</Button>
					</div>
				</div>
				<h3 className={styles.relatedTemplatesHeader}>
					Related templates
				</h3>
				<TemplateItemsGrid
					templates={relatedTemplates}
					setIsOpen={setIsOpen}
					setPresentedTemplate={setPresentedTemplate}
				/>
			</div>
		</div>
	);
};
