import { useTranslation } from "react-i18next";
import React from "react";
import styles from "./MiroBoards.module.css";

interface IMiroBoardsProps {
	isOpen: boolean;
}

export function MiroBoards({ isOpen = false }: IMiroBoardsProps) {
	const { t } = useTranslation();

	return (
		<div className={`${styles.modal} ${isOpen ? styles.open : null}`}>
			<div className={styles.wr}>
				<h1>{t("miro.boardsTitle")}</h1>
			</div>
		</div>
	);
}
