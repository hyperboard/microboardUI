import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { IMiroBoard, IMiroBoardItem } from "../MiroBoards/MiroBoardsModels";
import { App } from "App";
import { useCopyBoardItems } from "./useCopyBoardItems";
import { getApiUrl } from "Config";
import { Modal } from "shared/ui-lib/Modal";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import styles from "../ImportMiroBoards.module.css";
import { ProgressBar } from "shared/ui-lib/Progress/Progress";
import { Button } from "shared/ui-lib/Button";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import { useBoardRenameContext } from "View/BoardName";
import { MiroItemsInfo } from "../ImportMiroBoards";
import { useModal } from "View/Modal/ModalProvider";
import { useAppContext } from "View/AppContext";

interface IImportBoardItem {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	boardInfo: Pick<IMiroBoard, "id" | "name">;
	boardItems: IMiroBoardItem[];
	setBoardItems: (items: any) => void;
	itemsInfo: MiroItemsInfo;
	setItemsInfo: (info: MiroItemsInfo) => void;
	loadingPercentage: number;
}

export function ImportBoardItem(props: IImportBoardItem): React.ReactElement {
	const {
		isOpen,
		setIsOpen,
		boardInfo,
		boardItems,
		setBoardItems,
		itemsInfo,
		setItemsInfo,
		loadingPercentage,
	} = props;
	const { app } = useAppContext();
	const { isModalOpen, hideModal, showModal } = useModal();
	const { handleAddNew } = useSidePanelContext();
	const { setRenamingBoardId, setNewBoardName } = useBoardRenameContext();
	const { t } = useTranslation();
	const LIMIT_MIRO_ITEMS = 20;

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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
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
		} catch (error) {
			console.error(error);
			onCloseModal();
			hideModal("loadingNotification");
			hideModal("errorNotification");
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
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
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
		} catch (error) {
			console.error(error);
			onCloseModal();
			hideModal("loadingNotification");
			hideModal("errorNotification");
		}
	};

	const createNewBoard = async () => {
		await handleAddNew(boardId => {
			setNewBoardName(boardInfo.name);
			setRenamingBoardId(boardId);

			const board = app.getBoard();
			useCopyBoardItems(board, boardItems);
			showModal("successNotification");
		}).catch(console.error);
		// TODO notify user;
	};

	useEffect(() => {
		fetchBoardsItems();
		fetchBoardsItemsConnectors();
	}, []);

	useEffect(() => {
		if (
			itemsInfo.cursor.items !== "" &&
			!isModalOpen("errorNotification")
		) {
			fetchBoardsItems();
		}
	}, [itemsInfo.cursor.items]);

	useEffect(() => {
		if (
			itemsInfo.cursor.connectors !== "" &&
			!isModalOpen("errorNotification")
		) {
			fetchBoardsItemsConnectors();
		}
	}, [itemsInfo.cursor.connectors]);

	useEffect(() => {
		if (loadingPercentage === 100 && !isModalOpen("errorNotification")) {
			onCloseModal();
			isModalOpen("loadingNotification") &&
				hideModal("loadingNotification");
			createNewBoard();
		}
	}, [loadingPercentage]);

	const onCloseModal = (): void => setIsOpen(false);

	const collapseModal = (): void => {
		onCloseModal();
		showModal("loadingNotification");
	};

	return (
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
				width={Number(loadingPercentage)}
				classnames={styles.progress}
			/>
		</Modal>
	);
}
