/* eslint-disable react/prop-types */
import { App } from "App";
import { LAST_BOARD_KEY } from "App/App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { AppView } from "View/AppView";
import { AppContext } from "./AppContext";
import { BoardRenameContextProvider } from "./BoardName";
import { ContextMenuContextProvider } from "./ContextMenu";
import { useModalInfoContext } from "./Modal/InfoModal";
import ModalsWrapper from "./Modal/ModalsWrapper";
import { SidePanelContextProvider } from "./SidePanel/SidePanelContext";
import { RenameContextProvider } from "./Rename/RenameContext";
// import "./index.css";
type Props = {
	app: App;
};

const BoardView = ({ app }: Props): JSX.Element => {
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	const { pathname } = useLocation();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;
	const boardsList = useBoardsList();
	const account = useAccount();

	const { openModalInfo } = useModalInfoContext();

	app.connection.wsClient.onAccessDenied = async (
		deniedBoardId: string,
		forceUpdate = false,
	) => {
		if (
			forceUpdate ||
			(deniedBoardId === board.getBoardId() &&
				!app.boardsList.showedErrorModals[deniedBoardId] &&
				!isOpenMiroBoards)
		) {
			openModalInfo(
				t("modalInfo.accessDenied.title"),
				t("modalInfo.accessDenied.description"),
			);
			if (!account.isLoggedIn) {
				await boardsList.remove(board.getBoardId());
			}
			navigate("/boards");
			await app.openBoard("blank");
			app.render();
			app.boardsList.showedErrorModals[deniedBoardId] = true;
		}
	};

	useLayoutEffect(() => {
		account.init().finally(() => {
			boardsList.loadBoards().then(() => {
				if (params.boardId) {
					app.openBoard(params.boardId).then(() => {
						navigate(`/boards/${params.boardId}?${searchParams}`, {
							replace: true,
						});
						app.render();
					});
				} else {
					boardsList.createBoard().then(boardId => {
						app.openBoard(boardId).then(() => {
							navigate(`/boards/${boardId}?${searchParams}`, {
								replace: true,
							});
							app.render();
						});
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
			<ModalsWrapper>
				<ContextMenuContextProvider>
					<BoardRenameContextProvider>
						<RenameContextProvider>
							<SidePanelContextProvider>
								<AppView />
							</SidePanelContextProvider>
						</RenameContextProvider>
					</BoardRenameContextProvider>
				</ContextMenuContextProvider>
			</ModalsWrapper>
		</AppContext.Provider>
	);
};

const BoardViewWithModals = (props: Props): JSX.Element => (
	<ModalsWrapper>
		<BoardView {...props} />
	</ModalsWrapper>
);

export { BoardViewWithModals as BoardView };
