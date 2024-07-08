import { Mbr } from "Board/Items";
import React from "react";
import { useNavigate } from "react-router-dom";
import { App } from "../App";
import boardData from "./welcomeBoard.json";

type Props = { app: App };

const INITIAL_FIT_AREA = {
	left: 0,
	top: 140,
	right: 550,
	bottom: 730,
};

export function WelcomeBoard({ app }: Props) {
	const navigate = useNavigate();

	const createPublicBoard = async (app: App): Promise<string> => {
		const lastBoardId = app.getLastBoardId();
		if (lastBoardId) {
			app.openBoard(lastBoardId);
			return lastBoardId;
		}

		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		const board = app.getBoard();
		board.paste(boardData);
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
		createPublicBoard(app).then(boardId => {
			navigate(`/boards/${boardId}`);
		});
	}, [app]);

	return <div>WelcomeBoard</div>;
}
