/* eslint-disable react/prop-types */
import { App } from "App";
import React, { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppView } from "./AppView";
// import "./index.css";
type Props = {
	app: App;
};

export const BoardView = ({ app }: Props) => {
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	const nav = useNavigate();
	useLayoutEffect(() => {
		if (params.boardId) {
			app.openBoard(params.boardId).then(() => {
				app.render();
			});
		} else {
			app.boardsList.createBoard().then(id => {
				app.openBoard(id);
				nav(`/boards/${id}`, { replace: true });
				app.render();
			});
		}
	}, []);

	if (!board) {
		return <div></div>;
	}

	return <AppView app={app} />;
};
