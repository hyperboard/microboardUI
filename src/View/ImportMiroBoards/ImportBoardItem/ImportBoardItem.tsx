import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import styles from "../MiroBoards/MiroBoards.module.css";
import Cookies from "js-cookie";

interface IImportBoardItem {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	boardId: string;
}

export function ImportBoardItem({
	isOpen,
	setIsOpen,
	boardId,
}: IImportBoardItem) {
	const { t } = useTranslation();
	const onCloseModal = () => setIsOpen(false);

	const fetchBoardsItems = async () => {
		try {
			const token = Cookies.get("miro_accessToken");
			const response = await fetch(
				"https://api.miro.com/v2/boards/" + boardId + "/items",
				{
					headers: {
						Authorization: "Bearer" + token,
						Accept: "application/json",
					},
				},
			);
			const data = await response.json();
			console.log("data", data);
			return data;
		} catch (error) {
			console.error(error as Error);
		}
	};

	useEffect(() => {
		fetchBoardsItems();
	}, []);

	return (
		<div
			className={`${styles.modal} ${isOpen ? styles.open : null}`}
			onClick={onCloseModal}
		>
			<div className={styles.wr} onClick={e => e.stopPropagation()}>
				<h2>{t("miro.importMiro")}</h2>
				<p>Loading...</p>
			</div>
		</div>
	);
}
