/* eslint-disable react/prop-types */
import { App } from "App";
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
import { Tolgee, DevTools, TolgeeProvider, FormatSimple } from "@tolgee/react";
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

	const { openModalInfo } = useModalInfoContext();

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

	const tolgee = Tolgee()
		.use(DevTools())
		.use(FormatSimple())
		.init({
			language: "en",
			availableLanguages: ["en", "ru"],
			observerType: "text",
			// observerOptions: {},

			// for development
			apiUrl: import.meta.env.TOLGEE_API_URL || "https://app.tolgee.io",
			apiKey:
				import.meta.env.TOLGEE_API_KEY ||
				"tgpak_geydamzsl53gs4tbgbyw6ndfg5zwizdpnu2gqmlun4zggy3sgzya",
			projectId: import.meta.env.TOLGEE_PROJECT_ID || 10032,

			// for production
			staticData: {},
		});

	if (!board) {
		return <div></div>;
	}

	return (
		<TolgeeProvider tolgee={tolgee}>
			<AppContext.Provider value={{ app, board }}>
				<ModalsWrapper>
					<ContextMenuContextProvider>
						<BoardRenameContextProvider>
							<SidePanelContextProvider>
								<AppView />
							</SidePanelContextProvider>
						</BoardRenameContextProvider>
					</ContextMenuContextProvider>
				</ModalsWrapper>
			</AppContext.Provider>
		</TolgeeProvider>
	);
};

const BoardViewWithModals = (props: Props): JSX.Element => (
	<ModalsWrapper>
		<BoardView {...props} />
	</ModalsWrapper>
);

export { BoardViewWithModals as BoardView };
