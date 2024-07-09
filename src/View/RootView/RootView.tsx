import { App } from "App";
import React from "react";
import { useNavigate } from "react-router-dom";

type RootViewProps = {
	app: App;
};

const RootView: React.FC<RootViewProps> = ({ app }) => {
	const navigate = useNavigate();

	const createPublicBoard = async (app: App): Promise<string> => {
		const board = await app.createPublicBoard();
		app.openBoard(board);
		return board;
	};

	React.useEffect(() => {
		createPublicBoard(app).then(boardId => {
			navigate(`/boards/${boardId}`);
		});
	}, []);

	return <div>RootView</div>;
};

export default RootView;
