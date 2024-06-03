/* eslint-disable react/prop-types */
import React from "react";
import { App } from "App";
import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { AppView } from "./AppView";

export const BoardView: React.FC<{ app: App }> = props => {
	const board = props.app.getBoard();
	const params = useParams<{ boardId: string }>();
	useLayoutEffect(() => {
		if (params.boardId) {
			localStorage.setItem("lastSeenBoard", params.boardId);
			props.app.openBoard(params.boardId);
			props.app.render();
		}
	}, []);

	if (!board) {
		return <div></div>;
	}

	return <AppView app={props.app} />;
};
