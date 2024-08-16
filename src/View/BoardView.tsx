/* eslint-disable react/prop-types */
import { App } from "App";
import React, { useLayoutEffect, useRef, useState } from "react";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { AppContext } from "./AppContext";
import { AppView } from "View/AppView";
import { InfoModal, ModalContext } from "./Modal/InfoModal";
import { useTranslation } from "react-i18next";
import { SidePanelContextProvider } from "./SidePanel/SidePanelContext";
import { ContextMenuContextProvider } from "./ContextMenu";
// import "./index.css";
type Props = {
	app: App;
};

export const BoardView = ({ app }: Props) => {
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	const { pathname } = useLocation();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;

	const [modalInfo, setModalInfo] = useState<{
		title: string;
		description: string;
		opened: boolean;
	}>({ opened: false, title: "", description: "" });

	const openModalInfo = (title: string, description: string): void => {
		setModalInfo({ title, description, opened: true });
	};

	app.connection.wsClient.onAccessDenied = (
		deniedBoardId: string,
		forceUpdate = false,
	) => {
		if (
			forceUpdate ||
			(deniedBoardId === board.getBoardId() &&
				!app.storage.showedErrorModals[deniedBoardId] &&
				!isOpenMiroBoards)
		) {
			openModalInfo(
				t("modalInfo.accessDenied.title"),
				t("modalInfo.accessDenied.description"),
			);
			navigate("/boards");
			app.openBoard("blank");
			app.render();
			app.storage.showedErrorModals[deniedBoardId] = true;
		}
	};

	useLayoutEffect(() => {
		if (params.boardId || pathname === "/boards") {
			app.openBoard(params.boardId || "blank");
			app.render();
		}
	}, []);

	if (!board) {
		return <div></div>;
	}

	return (
		<ModalContext.Provider value={{ openModalInfo }}>
			<AppContext.Provider value={{ app, board }}>
				<ContextMenuContextProvider>
					<SidePanelContextProvider>
						<AppView />
					</SidePanelContextProvider>
				</ContextMenuContextProvider>
				<InfoModal
					isOpen={modalInfo.opened}
					title={modalInfo.title}
					description={modalInfo.description}
					onClose={() =>
						setModalInfo({
							opened: false,
							title: "",
							description: "",
						})
					}
				/>
			</AppContext.Provider>
		</ModalContext.Provider>
	);
};
