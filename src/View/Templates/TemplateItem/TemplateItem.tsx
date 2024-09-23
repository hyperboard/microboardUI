import React from "react";
import { BoardSnapshot } from "../../../Board/Board";
import { Button } from "../../../shared/ui-lib/Button";
import styles from "./templateItem.module.css";
import { useAppContext } from "../../AppContext";

interface TemplateItemProps {
	preview: string;
	description: string;
	language: string;
	tags: string[];
	snapshot: BoardSnapshot;
	setIsOpen: (isOpen: boolean) => void;
}

export const TemplateItem = ({
	preview,
	language,
	tags,
	snapshot,
	description,
	setIsOpen,
}: TemplateItemProps) => {
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
		<div className={styles.card}>
			<img
				className={styles.image}
				src={preview}
				alt="template preview"
			/>
			<div className={styles.shortInfo}>
				<p>{`language: ${language}`}</p>
				<div>
					tags:
					{tags && tags.map(tag => <p key={tag}>#{tag}</p>)}
				</div>
			</div>
			<p>{`${description}`}</p>
			<Button>Preview</Button>
			<Button onClick={pasteSnapshot}>Use</Button>
		</div>
	);
};
