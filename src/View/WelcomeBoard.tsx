import { ItemData, Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { App } from "../App";
import boardDataRu from "./welcomeBoard.json";
import boardDataEn from "./welcomeBoardEn.json";

type Props = { app: App };

const INITIAL_FIT_AREA = {
	left: 0,
	top: -150,
	right: 1550,
	bottom: 850,
};

export function WelcomeBoard({ app }: Props): React.ReactElement {
	const navigate = useNavigate();
	const { i18n, t } = useTranslation();

	const createPublicBoard = async (app: App): Promise<string> => {
		const lastBoardId = app.getLastBoardId();
		if (lastBoardId) {
			app.openBoard(lastBoardId);
			return lastBoardId;
		}

		const boardId = await app.createPublicBoard(
			t("board.welcomeBoardTitle"),
		);
		app.openBoard(boardId);
		const board = app.getBoard();

		if (i18n.language === "ru") {
			board.paste(
				boardDataRu as unknown as {
					[key: string]: ItemData;
				},
				false,
			);
		} else {
			board.paste(
				boardDataEn as unknown as {
					[key: string]: ItemData;
				},
				false,
			);
		}

		const mbr = new Mbr(
			INITIAL_FIT_AREA.left,
			INITIAL_FIT_AREA.top,
			INITIAL_FIT_AREA.right,
			INITIAL_FIT_AREA.bottom,
		);
		board.selection.removeAll();
		board.camera.zoomToFit(mbr);
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

	return <div>WelcomeBoard</div>;
}
