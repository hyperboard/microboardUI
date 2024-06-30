/* eslint-disable react/prop-types */
import { App } from "App";
import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { AppView } from "./AppView";
// import "./index.css";
type Props = {
	app: App;
};

export const BoardView = ({ app }: Props) => {
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	useLayoutEffect(() => {
		if (params.boardId) {
			app.openBoard(params.boardId);
			app.render();
		}
	}, []);

	if (!board) {
		return <div></div>;
	}

	return <AppView app={app} board={board} />;
};
