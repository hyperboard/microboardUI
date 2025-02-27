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
import { USER_PLAN_MODAL_ID } from "./UserPlan";
import { notify } from "./Ui/Toast";
import { billingApi } from "shared/api";

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
			navigate("/boards");
			await app.openBoard("blank");
			app.render();
		}
	};

	useLayoutEffect(() => {
		boardsList.loadBoards().then(() => {
			if (params.boardId?.includes("local")) {
				app.openBoardFromFile().then(() => {
					navigate(`/boards/${params.boardId}?${searchParams}`, {
						replace: true,
					});
					app.render();
				});
			} else if (params.boardId) {
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
				// const lastSeenBoard = localStorage.getItem("lastSeenBoard");
				// if (lastSeenBoard) {
				// 	app.openBoard(lastSeenBoard).then(() => {
				// 		navigate(`/boards/${lastSeenBoard}`, {
				// 			replace: true,
				// 		});
				// 		app.render();
				// 	});
				// } else {
				// 	boardsList.createBoard().then(boardId => {
				// 		app.openBoard(boardId).then(() => {
				// 			navigate(`/boards/${boardId}`, {
				// 				replace: true,
				// 			});
				// 			app.render();
				// 		});
				// 	});
				// }
				app.openBoard("blank").then(() => {
					navigate(`/boards/blank`, {
						replace: true,
					});
					app.render();
				});
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

const BoardViewWithModals = (props: Props): JSX.Element => (
	<ModalsWrapper>
		<BoardView {...props} />
	</ModalsWrapper>
);

export { BoardViewWithModals as BoardView };
