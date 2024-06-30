import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { App } from "App";
import { useNavigate } from "react-router-dom";
import { useCopyBoardItems } from "./useCopyBoardItems";
import { getApiUrl } from "Config";
import { ImportMiroModal } from "../ImportMiroModal";

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
	const [error, setError] = useState<string | null>(null);
	const errorMessage = "Произошла ошибка. Попробуйте еще раз импортировать";
	const [itemsInfo, setItemsInfo] = useState<{
		cursor: { items: string; connectors: string };
		total: { items: number; connectors: number };
	}>({
		cursor: { items: "", connectors: "" },
		total: { items: -1, connectors: -1 },
	});

	const token = Cookies.get("miro_accessToken");
	const options = {
		headers: {
			Authorization: "Bearer " + token,
			Accept: "application/json",
		},
	};

	const getCursor = (cursor: string): string =>
		cursor !== "" ? "cursor=" + cursor : "";

	const fetchBoardsItems = async () => {
		try {
			const cursor = getCursor(itemsInfo.cursor.items);
			const response = await fetch(
				getApiUrl(
					"/miro/boards/" + boardId + "/items?limit=50&" + cursor,
				),
				options,
			);
			const data = await response.json();
			setBoardItems(items => [...items, ...data.data]);
			setItemsInfo(info => {
				return {
					cursor: {
						items: data.cursor ?? "",
						connectors: info.cursor.connectors,
					},
					total: {
						items: data.total,
						connectors: info.total.connectors,
					},
				};
			});
		} catch (error: Error) {
			console.error(error as Error);
			setError(errorMessage);
		}
	};

	const fetchBoardsItemsConnectors = async () => {
		try {
			const cursor = getCursor(itemsInfo.cursor.connectors);
			const response = await fetch(
				getApiUrl(
					"/miro/boards/" +
						boardId +
						"/connectors?limit=50&" +
						cursor,
				),
				options,
			);
			const data = await response.json();
			setBoardItems(items => [...items, ...data?.data]);
			setItemsInfo(info => {
				return {
					cursor: {
						items: info.cursor.items,
						connectors: data.cursor ?? "",
					},
					total: {
						items: info.total.items,
						connectors: data.total,
					},
				};
			});
		} catch (error: Error) {
			console.error(error as Error);
			setError(errorMessage);
		}
	};

	useEffect(() => {
		fetchBoardsItems();
		fetchBoardsItemsConnectors();
	}, []);

	useEffect(() => {
		itemsInfo.cursor.items !== "" && fetchBoardsItems();
	}, [itemsInfo.cursor.items]);

	useEffect(() => {
		itemsInfo.cursor.connectors !== "" && fetchBoardsItemsConnectors();
	}, [itemsInfo.cursor.connectors]);

	useEffect(() => {
		if (
			boardItems &&
			itemsInfo.total.items + itemsInfo.total.connectors ===
				boardItems.length
		) {
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
	}, [boardItems, itemsInfo.total]);

	const onCloseModal = () => setIsOpen(false);

	return (
		<ImportMiroModal isOpen={isOpen} setIsOpen={setIsOpen}>
			<h2>{t("miro.importMiro")}</h2>
			{error ? <p>{error}</p> : <p>Loading...</p>}
		</ImportMiroModal>
	);
}
