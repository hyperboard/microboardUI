/* eslint-disable react/prop-types */
import { LAST_BOARD_KEY } from "App/App";
import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { ACCESS_DENIED_MODAL } from "features/AccessDeniedModal";
import { AppContext, useAppContext } from "features/AppContext";
import { AppView } from "features/AppView";
import { USER_PLAN_MODAL_ID } from "features/UserPlan";
import Cookies from "js-cookie";
import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { billingApi } from "shared/api";
import { notify } from "shared/ui-lib/Toast";
import { useUiModalContext } from "shared/ui-lib/UiModal";
import { pasteWelcomeBoardData } from "./WelcomePage/WelcomePage";

export const BoardPage = (): JSX.Element => {
	const { app } = useAppContext();
	const board = app.getBoard();
	const params = useParams<{ boardId: string }>();
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { search } = useLocation();
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;
	const boardsList = useBoardsList();
	const account = useAccount();
	const { openModal } = useUiModalContext();

	app.connection.onAccessDenied = async (
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
			navigate("/boards/blank");
			await app.openBoard("blank");
			app.render();
		}
	};

	useLayoutEffect(() => {
		boardsList.loadBoards().then(() => {
			if (params.boardId?.includes("local")) {
				app.openBoardFromFile().then(() => {
					navigate(`/boards/${params.boardId}${search}`, {
						replace: true,
					});
					app.render();
				});
			} else if (params.boardId && params.boardId !== "blank") {
				app.openBoard(
					params.boardId,
					searchParams.get("accessKey") || undefined,
				).then(() => {
					navigate(`/boards/${params.boardId}${search}`, {
						replace: true,
					});
					app.render();
				});
			} else {
				const lastSeenBoard = localStorage.getItem(LAST_BOARD_KEY);
				const isFirstVisit = !Cookies.get("first_visit");
				if (lastSeenBoard) {
					app.openBoard(lastSeenBoard).then(() => {
						navigate(`/boards/${lastSeenBoard}${search}`, {
							replace: true,
						});
						app.render();
					});
				} else if (isFirstVisit) {
					boardsList
						.createBoard(t("board.welcomeBoardTitle"), true)
						.then(boardId => {
							app.openBoard(boardId).then(() => {
								navigate(`/boards/${boardId}`, {
									replace: true,
								});
								app.render();

								const board = app.getBoard();
								pasteWelcomeBoardData(board, i18n.language);
							});
						});
				} else {
					boardsList.createBoard().then(boardId => {
						app.openBoard(boardId).then(() => {
							navigate(`/boards/${boardId}`, {
								replace: true,
							});
							app.render();
						});
					});
				}
			}

			const paymentStatus = searchParams.get("paymentStatus");
			if (paymentStatus) {
				openModal(USER_PLAN_MODAL_ID);

				if (paymentStatus === "success") {
					billingApi
						.verifyPayment()
						.then(() => {
							notify({
								header: "Статус оплаты",
								body: "Оплата успешно прошла",
								variant: "success",
							});
							account.fetchBillingInfo();
						})
						.catch(() => {
							notify({
								header: "Статус оплаты",
								body: "Произошла ошибка",
								variant: "error",
							});
						});
				}

				if (paymentStatus === "error") {
					notify({
						header: "Статус оплаты",
						body: "Произошла ошибка",
						variant: "error",
					});
				}

				searchParams.delete("paymentStatus");
			}
		});
	}, []);

	if (!board || !account.isInitialized) {
		return <div></div>;
	}

	return (
		<AppContext.Provider value={{ app, board }}>
			<AppView />
		</AppContext.Provider>
	);
};
