import React, { useState } from "react";
import styles from "./DashboardView.module.css";
import { useNavigate } from "react-router-dom";
import { App } from "App";
// import { WhiteboardModuleView } from 'WhiteBoardModule/WhiteBoardModuleNative';
import { getApiUrl } from "Config";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

interface BoardCardProps extends React.HTMLAttributes<HTMLDivElement> {
	name: string;
}

type PrivateBoards = {
	privateBoards: { board: string }[];
};

const fetchPrivateBoards = async (): Promise<PrivateBoards | undefined> => {
	try {
		console.log("fetchPrivateBoards");
		const privateBoards = await fetch(getApiUrl("/boards/private"), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("accessToken")}`,
			},
		});
		const data = await privateBoards.json();
		console.log("data: ", data);
		return data;
	} catch (error) {
		console.log("error: ", error);
		return undefined;
	}
};

const BoardCard: React.FC<BoardCardProps> = ({ name }) => {
	const navigate = useNavigate();
	const onClick = () => {
		navigate(`/boards/${name}`);
	};

	return (
		<div className={styles["boardCard"]} onClick={onClick}>
			<div className={styles["boardCardBackground"]}></div>
			<div className={styles["boardCardTitle"]}>{name}</div>
			<div className={styles["boardCardDate"]}>
				7 February, 2024, 12:00
			</div>
		</div>
	);
};

const AddBoard: React.FC<{ app: App }> = ({ app }) => {
	const navigate = useNavigate();

	return (
		<div
			className={styles["addBoard"]}
			onClick={async () => {
				const boardId = await app.createPublicBoard();
				console.log(boardId);
				if (boardId) {
					navigate(`/boards/${boardId}`);
				}
			}}
		>
			<span className={styles["addBoardPlus"]}>+</span>
		</div>
	);
};

export const DashboardView: React.FC<{ app: App }> = props => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const boards = props.app.storage.listPublicBoards();
	const [privateBoards, setPrivateBoards] = useState<
		PrivateBoards | undefined
	>();

	React.useEffect(() => {
		if (!boards.length || window.self !== window.top) {
			return;
		}
	}, []);

	React.useEffect(() => {
		if (Cookies.get("accessToken")) {
			fetchPrivateBoards().then(data => {
				setPrivateBoards(data);
			});
		}
	}, []);

	return (
		<div className={styles["dashboardWrapper"]}>
			<h1>{t("dashboard.title")}</h1>
			{window.self !== window.top ? null : (
				<>
					<h2>{t("dashboard.publicBoards")}</h2>
					<div className={styles["boardGrid"]}>
						<AddBoard app={props.app} />
						{boards.map(board => (
							<BoardCard
								key={board.boardId}
								name={
									board.name ||
									board.boardId ||
									t("dashboard.unnamed")
								}
								onClick={() => {
									// props.app.openBoard(board.boardId);
									navigate(`/boards/${board.boardId}`, {
										replace: true,
									});
								}}
							/>
						))}
					</div>
				</>
			)}

			<h2>{t("dashboard.privateBoards")}</h2>
			<div className={styles["boardGrid"]}>
				{privateBoards?.privateBoards?.length
					? privateBoards.privateBoards.map(board => (
							<BoardCard key={board.board} name={board.board} />
					  ))
					: t("dashboard.noPrivateBoards")}
			</div>

			<div>Test frame (first public board):</div>
			<div id="frameTest"></div>
			<div></div>
		</div>
	);
};
