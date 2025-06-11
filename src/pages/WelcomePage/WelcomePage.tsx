import { App } from "App";
import { useBoardsList } from "App/useBoardsList";
import { Item, Board } from "microboard-temp";
import { useAppContext } from "features/AppContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import boardDataRu from "./welcomeBoard.json";
import boardDataEn from "./welcomeBoardEn.json";

export const pasteWelcomeBoardData = (board: Board, lang: string) => {
	const baseUrl = window.location.origin;
	const storageIndex = baseUrl === "https://dev-app.microboard.io" ? 0 : 1;
	const boardData = lang === "ru" ? boardDataRu : boardDataEn;
	const filteredBoardData = Object.fromEntries(
		Object.entries(boardData).map(([id, item]) => {
			if (item.itemType === "Image" && Array.isArray(item.storageLink)) {
				return [
					id,
					{
						...item,
						storageLink: item.storageLink[storageIndex],
					},
				];
			}
			return [id, item];
		}),
	);

	board.paste(
		filteredBoardData as unknown as {
			[key: string]: Item;
		},
		false,
		false,
	);

	const mbr = board.items.getMbr();
	board.selection.removeAll();
	board.camera.zoomToFit(mbr);
};

export function WelcomePage(): React.ReactElement {
	const { app } = useAppContext();
	const navigate = useNavigate();
	const { i18n, t } = useTranslation();
	const boardsList = useBoardsList();

	const createPublicBoard = async (app: App): Promise<string> => {
		const lastBoardId = app.getLastBoardId();
		if (lastBoardId) {
			await app.openBoard(lastBoardId);
			return lastBoardId;
		}

		const boardId = await boardsList.createBoard(
			t("board.welcomeBoardTitle"),
			true,
		);
		await app.openBoard(boardId);
		const board = app.getBoard();
		pasteWelcomeBoardData(board, i18n.language);
		return boardId;
	};

	React.useEffect(() => {
		createPublicBoard(app)
			.then(boardId => {
				navigate(`/boards/${boardId}`);
			})
			.catch(console.error);
		// TODO notify user
	}, [app]);

	return null;
}
