import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { App } from "App";
import { useNavigate } from "react-router-dom";
import { useCopyBoardItems } from "./useCopyBoardItems";
import { getApiUrl } from "Config";
import { Modal } from "shared/ui-lib/Modal";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import { Loader } from "shared/ui-lib/Loader/Loader";
import styles from "../ImportMiroBoards.module.css";
import { Message } from "shared/ui-lib/Message/Message";

interface IImportBoardItem {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	boardId: string;
	app: App;
}

export function ImportBoardItem(props: IImportBoardItem): React.ReactElement {
	const { isOpen, setIsOpen, boardId, app } = props;
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [boardItems, setBoardItems] = useState<IMiroBoardItem[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isOpenSuccessMessage, setIsOpenSuccessMessage] =
		useState<boolean>(false);
	const errorMessage = t("miro.miroError");
	const LIMIT_MIRO_ITEMS = 20;
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
					"/miro/boards/" +
						boardId +
						"/items?limit=" +
						LIMIT_MIRO_ITEMS +
						"&" +
						cursor,
				),
				options,
			);
			const boardItems = await response.json();
			const {
				data: boardItemsData,
				cursor: currentBoardItemsCursor,
				total,
			} = boardItems;

			setBoardItems(items => [...items, ...boardItemsData]);
			setItemsInfo(info => {
				return {
					cursor: {
						items: currentBoardItemsCursor ?? "",
						connectors: info.cursor.connectors,
					},
					total: {
						items: total,
						connectors: info.total.connectors,
					},
				};
			});
		} catch (error: Error) {
			console.error(error);
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
						"/connectors?limit=" +
						LIMIT_MIRO_ITEMS +
						"&" +
						cursor,
				),
				options,
			);
			const connectors = await response.json();
			const {
				data: connectorsItems,
				cursor: currentConnectorsCursor,
				total,
			} = connectors;

			setBoardItems(items => [...items, ...connectorsItems]);
			setItemsInfo(info => {
				return {
					cursor: {
						items: info.cursor.items,
						connectors: currentConnectorsCursor ?? "",
					},
					total: {
						items: info.total.items,
						connectors: total,
					},
				};
			});
		} catch (error: Error) {
			console.error(error);
			setError(errorMessage);
		}
	};

	const createNewBoard = async () => {
		await app.createPublicBoard().then((id: string) => {
			app.openBoard(id);
			navigate(`/boards/${id}`, {
				replace: true,
			});
			const board = app.getBoard();
			useCopyBoardItems(board, boardItems);
		});
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
		if (isOpenSuccessMessage) {
			setTimeout(() => {
				setIsOpenSuccessMessage(false);
			}, 10000);
		}
	}, [isOpenSuccessMessage]);

	useEffect(() => {
		if (
			isOpen &&
			boardItems &&
			itemsInfo.total.items + itemsInfo.total.connectors ===
				boardItems.length
		) {
			onCloseModal();
			createNewBoard();
			setIsOpenSuccessMessage(true);
		}
	}, [boardItems, itemsInfo.total]);

	const onCloseModal = (): void => setIsOpen(false);

	return (
		<>
			<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.S}>
				<h2 className={styles.title}>{t("miro.importMiro")}</h2>
				<p className={styles.text}>{t("miro.importItemsModalText")}</p>
				{error ? <p>{error}</p> : <Loader />}
			</Modal>
			<Message isOpen={isOpenSuccessMessage}>
				The board exported successfully!
			</Message>
		</>
	);
}
