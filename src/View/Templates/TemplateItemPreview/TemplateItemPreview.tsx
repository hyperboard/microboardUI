import React from "react";
import { Button } from "../../../shared/ui-lib/Button";
import { BoardSnapshot } from "../../../Board/Board";
import { Template } from "../types";
import { useAppContext } from "../../AppContext";
import styles from "./TemplateItemPreview.module.css";

interface TemplateItemPreviewProps {
	name: string;
	language: string;
	description: string;
	tags: string[];
	snapshot: BoardSnapshot;
	setPresentedTemplate: (template: null | Template) => void;
	setIsOpen: (isOpen: boolean) => void;
	viewLinkId: string;
}

export const TemplateItemPreview = ({
	name,
	language,
	description,
	snapshot,
	setPresentedTemplate,
	setIsOpen,
	tags,
	viewLinkId,
}: TemplateItemPreviewProps) => {
	const { board } = useAppContext();

	const pasteSnapshot = () => {
		setIsOpen(false);
		if (board.events && snapshot) {
			board.paste(snapshot.items, true);
			if (!board.tools.getSelect()) {
				board.tools.select();
			}
			const itemsMbr = board.items.getMbr();
			board.camera.zoomToFit(itemsMbr);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.header}>
				<Button
					className={styles.backBtn}
					onClick={() => setPresentedTemplate(null)}
				>
					Back
				</Button>
			</div>
			<div className={styles.mainSection}>
				<div>
					<h2>{name}</h2>
					<Button className={styles.useBtn} onClick={pasteSnapshot}>
						Use template
					</Button>
				</div>
				<iframe
					className={styles.frame}
					src={`http://localhost:8000/boards/${viewLinkId}`}
				></iframe>
			</div>
			<div>
				<h3>About this template</h3>
				<p>Language: {language}</p>
				<p>{description}</p>
				<div>
					{tags.length
						? tags.map(tag => <p key={tag}>#{tag}</p>)
						: undefined}
				</div>
			</div>
		</div>
	);
};
