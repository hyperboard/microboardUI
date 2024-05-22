import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import styles from "../MiroBoards/MiroBoards.module.css";
import Cookies from "js-cookie";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { App } from "App";
import { Board } from "Board";
import { useNavigate } from "react-router-dom";
import { useCopyBoardItems } from "./useCopyBoardItems";

interface IImportBoardItem {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	boardId: string;
	app: App;
}

export function ImportBoardItem({
	isOpen,
	setIsOpen,
	boardId,
	app,
}: IImportBoardItem) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [boardItems, setBoardItems] = useState<IMiroBoardItem[]>([]);
	const [itemsInfo, setItemsInfo] = useState<{
		cursor: string;
		total: number;
	}>({ cursor: "", total: -1 });

	const fetchBoardsItems = async () => {
		try {
			const token = Cookies.get("miro_accessToken");
			const cursor =
				itemsInfo.cursor !== "" ? "cursor=" + itemsInfo.cursor : "";
			const response = await fetch(
				"https://api.miro.com/v2/boards/" +
					boardId +
					"/items?limit=50&" +
					cursor,
				{
					headers: {
						Authorization: "Bearer " + token,
						Accept: "application/json",
					},
				},
			);
			const data = await response.json();
			boardItems && setBoardItems([...boardItems, ...data.data]);
			setItemsInfo({ cursor: data.cursor ?? "", total: data.total });
		} catch (error) {
			console.error(error as Error);
		}
	};

	useEffect(() => {
		fetchBoardsItems();
	}, []);

	useEffect(() => {
		itemsInfo.cursor !== "" && fetchBoardsItems();
	}, [itemsInfo.cursor]);

	useEffect(() => {
		if (boardItems && itemsInfo.total === boardItems.length) {
			onCloseModal();
			app.createPublicBoard().then((id: string) => {
				app.openBoard(id);
				navigate(`/boards/${id}`, {
					replace: true,
				});
				const board = app.getBoard();
				useCopyBoardItems(board, boardItems);
			});
		}
	}, [boardItems, itemsInfo]);

	const onCloseModal = () => setIsOpen(false);

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
