import React from "react";
import styles from "./templateItem.module.css";
import { Template } from "../../../types";
import { Button } from "../../../../../shared/ui-lib/Button";
import { useAppContext } from "../../../../AppContext";
import { BoardSnapshot } from "../../../../../Board/Board";
import { pasteSnapshot } from "../../../../../utils";

interface TemplateItemProps {
	preview: string;
	name: string;
	setPresentedTemplate: (template: null | Template) => void;
	snapshot: BoardSnapshot;
	setIsOpen: (isOpen: boolean) => void;
}

export const TemplateItem = ({
	preview,
	name,
	setPresentedTemplate,
	snapshot,
	setIsOpen,
}: TemplateItemProps) => {
	const { board } = useAppContext();

	const pasteSnapshotAndClose = () => {
		setPresentedTemplate(null);
		setIsOpen(false);
		pasteSnapshot({ board, snapshot });
	};

	return (
		<div className={styles.card}>
			<div className={styles.imageBox}>
				<img
					onClick={setPresentedTemplate}
					className={styles.image}
					src={preview}
					alt="template preview"
				/>
				<div
					className={styles.buttonsBox}
					onClick={setPresentedTemplate}
				>
					<div>
						<Button
							onClick={setPresentedTemplate}
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
				<p>{name}</p>
			</div>
		</div>
	);
};
