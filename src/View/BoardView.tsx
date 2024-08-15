/* eslint-disable react/prop-types */
import { App } from "App";
import React, { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "./AppContext";
import { AppView } from "View/AppView";
import { InfoModal, ModalContext } from "./Modal/InfoModal";
import { useTranslation } from "react-i18next";
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
	const [modalInfo, setModalInfo] = useState<{
		title: string;
		description: string;
		opened: boolean;
	}>({ opened: false, title: "", description: "" });
	const showedModal = useRef<{ [key: string]: boolean }>({});

	const openModalInfo = (title: string, description: string): void => {
		setModalInfo({ title, description, opened: true });
	};

	app.connection.wsClient.onAccessDenied = () => {
		const boardId = board ? board.getBoardId() : undefined;
		if (boardId && !showedModal.current[boardId]) {
			openModalInfo(
				t("modalInfo.accessDenied.title"),
				t("modalInfo.accessDenied.description"),
			);
			app.openBoard("blank");
			app.render();
			navigate("/boards");
			showedModal.current[boardId] = true;
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
				<AppView />
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
