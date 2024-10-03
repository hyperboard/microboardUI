import React from "react";
import styles from "./templateItem.module.css";
import { Button } from "../../../../../shared/ui-lib/Button";
import { useAppContext } from "../../../../AppContext";
import { pasteSnapshot } from "../../../../../utils";
import { Template } from "../../../../Tools/Template";

interface TemplateItemProps {
	template: Template;
	setPresentedTemplate: (template: null | Template) => void;
	setIsOpen: (isOpen: boolean) => void;
}

export const TemplateItem = ({
	template,
	setPresentedTemplate,
	setIsOpen,
}: TemplateItemProps) => {
	const { board } = useAppContext();

	const pasteSnapshotAndClose = () => {
		setPresentedTemplate(null);
		setIsOpen(false);
		pasteSnapshot({ board, snapshot: template.snapshot });
	};

	return (
		<div className={styles.card}>
			<div className={styles.imageBox}>
				<img
					onClick={() => setPresentedTemplate(template)}
					className={styles.image}
					src={template.preview}
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
							Preview
						</Button>
						<Button
							onClick={pasteSnapshotAndClose}
							pattern="quaternary"
						>
							Use
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
