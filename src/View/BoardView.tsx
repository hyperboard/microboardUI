/* eslint-disable react/prop-types */
import { App } from "App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppView } from "View/AppView";
import { ACCESS_DENIED_MODAL } from "./AccessDeniedModal";
import { AppContext } from "./AppContext";
import ModalsWrapper from "./Modal/ModalsWrapper";
import { useUiModalContext } from "./Ui/UiModal";

type Props = {
	app: App;
};

const BoardView = ({ app }: Props): JSX.Element => {
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;
	const boardsList = useBoardsList();
	const account = useAccount();
	const { openModal } = useUiModalContext();

	app.connection.wsClient.onAccessDenied = async (
		deniedBoardId: string,
		forceUpdate = false,
	) => {
		if (
			forceUpdate ||
			(deniedBoardId === board.getBoardId() && !isOpenMiroBoards)
		) {
			openModal(ACCESS_DENIED_MODAL);
			const deniedBoard = app.getConnectedBoard(deniedBoardId);
			if (deniedBoard) {
				deniedBoard.disconnect();
			}
			if (!account.isLoggedIn) {
				await boardsList.removeBoard(board.getBoardId());
			}
			navigate("/boards");
			await app.openBoard("blank");
			app.render();
		}
	};

	useLayoutEffect(() => {
		account.init().finally(() => {
			boardsList.loadBoards().then(() => {
				// if (params.boardId === "local") {
				// 	app.openBoardFromFile().then(() => {
				// 		navigate(`/boards/${params.boardId}?${searchParams}`, {
				// 			replace: true,
				// 		});
				// 		app.render();
				// 	})
				// } else
				if (params.boardId) {
					app.openBoard(
						params.boardId,
						searchParams.get("accessKey") ?? undefined,
					).then(() => {
						navigate(`/boards/${params.boardId}?${searchParams}`, {
							replace: true,
						});
						app.render();
					});
				} else {
					app.openBoard("blank").then(() => {
						navigate(`/boards/blank`, {
							replace: true,
						});
						app.render();
					});
				}
			});
		});
	}, []);

	if (!board) {
		return <div></div>;
	}

	return (
		<AppContext.Provider value={{ app, board }}>
			<AppView />
		</AppContext.Provider>
	);
};

const BoardViewWithModals = (props: Props): JSX.Element => (
	<ModalsWrapper>
		<BoardView {...props} />
	</ModalsWrapper>
);

export { BoardViewWithModals as BoardView };
