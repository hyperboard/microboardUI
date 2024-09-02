import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
	IMiroBoard,
	IMiroBoardItem,
	MiroBoardItemTypes,
} from "../MiroBoards/MiroBoardsModels";
import { App } from "App";
import { useNavigate } from "react-router-dom";
import { useCopyBoardItems } from "./useCopyBoardItems";
import { getApiUrl } from "Config";
import { Modal } from "shared/ui-lib/Modal";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import styles from "../ImportMiroBoards.module.css";
import { ProgressBar } from "shared/ui-lib/Progress/Progress";
import { Button } from "shared/ui-lib/Button";
import { LoadingNotification } from "./LoadingNotification";
import { SuccessNotification } from "./SuccessNotification";
import { ErrorNotification } from "./ErrorNotification";

interface IImportBoardItem {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	boardInfo: Pick<IMiroBoard, "id" | "name">;
	app: App;
	setStage: (stage: number) => void;
}

export function ImportBoardItem(props: IImportBoardItem): React.ReactElement {
	const { isOpen, setIsOpen, boardInfo, app, setStage } = props;

	const { t } = useTranslation();
	const navigate = useNavigate();
	const [loadingNotification, setLoadingNotification] =
		useState<boolean>(false);
	const [boardItems, setBoardItems] = useState<IMiroBoardItem[]>([]);
	const [error, setError] = useState<boolean>(false);
	const [isOpenSuccessMessage, setIsOpenSuccessMessage] =
		useState<boolean>(false);
	const LIMIT_MIRO_ITEMS = 20;
	const [itemsInfo, setItemsInfo] = useState<{
		cursor: { items: string; connectors: string };
		total: { items: number; connectors: number };
	}>({
		cursor: { items: "", connectors: "" },
		total: { items: 0, connectors: 0 },
	});
	const loadingPercentage =
		Math.ceil(
			(boardItems.length /
				(itemsInfo.total.items + itemsInfo.total.connectors)) *
				100,
		) || 0;

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
						boardInfo.id +
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
			onCloseModal();
			setLoadingNotification(false);
			setError(true);
		}
	};

	const fetchBoardsItemsConnectors = async () => {
		try {
			const cursor = getCursor(itemsInfo.cursor.connectors);
			const response = await fetch(
				getApiUrl(
					"/miro/boards/" +
						boardInfo.id +
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
			onCloseModal();
			setLoadingNotification(false);
			setError(true);
		}
	};

	const createNewBoard = async () => {
		await app.createPublicBoard().then((id: string) => {
			app.openBoard(id);
			navigate(`/boards/${id}`, {
				replace: true,
			});
			const board = app.getBoard();
			// app.storage.renameBoard(board.getBoardId(), boardInfo.name);
			useCopyBoardItems(board, boardItems);
			setIsOpenSuccessMessage(true);
		});
	};

	useEffect(() => {
		fetchBoardsItems();
		fetchBoardsItemsConnectors();
	}, []);

	useEffect(() => {
		if (itemsInfo.cursor.items !== "" && !error) {
			fetchBoardsItems();
		}
	}, [itemsInfo.cursor.items]);

	useEffect(() => {
		if (itemsInfo.cursor.connectors !== "" && !error) {
			fetchBoardsItemsConnectors();
		}
	}, [itemsInfo.cursor.connectors]);

	useEffect(() => {
		if (loadingPercentage === 100 && !error) {
			onCloseModal();
			loadingNotification && setLoadingNotification(false);
			createNewBoard();
		}
	}, [loadingPercentage]);

	const isWarnMessageOpen = (): boolean =>
		boardItems.some(
			item =>
				item.type === MiroBoardItemTypes.CARD ||
				item.type === MiroBoardItemTypes.DOCUMENT ||
				item.type === MiroBoardItemTypes.MINDMAP,
		);

	const onCloseModal = (): void => setIsOpen(false);

	const collapseModal = (): void => {
		onCloseModal();
		setLoadingNotification(true);
	};

	return (
		<>
			<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.S}>
				<h2 className={styles.title}>{t("miro.importMiro")}</h2>
				<p className={styles.text}>
					{t("miro.items.modalText")} {loadingPercentage}%...
				</p>
				<Button
					pattern="tertiary"
					onClick={collapseModal}
					className={styles.itemsBtn}
				>
					{t("miro.items.closeModal")}
				</Button>
				<ProgressBar
					width={loadingPercentage}
					classnames={styles.progress}
				/>
			</Modal>
			<LoadingNotification
				loadingNotification={loadingNotification}
				loadingPercentage={loadingPercentage}
			/>
			<SuccessNotification
				isWarn={isWarnMessageOpen()}
				isOpen={isOpenSuccessMessage}
				setIsOpen={setIsOpenSuccessMessage}
			/>
			<ErrorNotification
				isOpen={error}
				setIsOpen={setError}
				setStage={setStage}
				setModalOpen={setIsOpen}
			/>
		</>
	);
}
