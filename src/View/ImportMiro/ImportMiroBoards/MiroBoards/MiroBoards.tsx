import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import styles from "../ImportMiroBoards.module.css";
import { useLocation } from "react-router-dom";
import { IMiroBoard, IMiroBoards } from "./MiroBoardsModels";
import { MiroBoardItem } from "./MiroBoardItem/MiroBoardsItem";
import Cookies from "js-cookie";
import { getApiUrl } from "Config";
import { Modal } from "shared/ui-lib/Modal";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import { Loader } from "shared/ui-lib/Loader/Loader";
import { Loader as ButtonLoader } from "shared/ui-lib/Button/Loader";
import { UiButton } from "View/Ui/UiButton";
import { ErrorBoardsNotification } from "./ErrorBoardsNotification";

interface IMiroBoardsProps {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	setStage: (stage: number) => void;
	setBoardInfo: ({ id, name }: Pick<IMiroBoard, "id" | "name">) => void;
}

export function MiroBoards({
	isOpen,
	setIsOpen,
	setStage,
	setBoardInfo,
}: IMiroBoardsProps): React.ReactElement {
	const { t } = useTranslation();
	const location = useLocation();
	const teamId = new URLSearchParams(location.search).get("team_id");
	const authCode = new URLSearchParams(location.search).get("code");
	const [boards, setBoards] = useState<IMiroBoard[] | null>(null);
	const [error, setError] = useState<boolean>(false);
	const BOARD_LIMIT = 9;
	const [boardsInfo, setBoardsInfo] = useState<Omit<IMiroBoards, "data">>({
		total: 0,
		offset: 0,
	});

	const fetchToken = async () => {
		try {
			// TODO using ENV after transferring to the client
			// const clientId = import.meta.env.MIRO_CLIENT_ID;
			// const clientSecret = import.meta.env.MIRO_CLIENT_SECRET;
			// const baseURl = import.meta.env.BASE_URL
			const clientId = "3458764589599848573";
			const clientSecret = "RWatK9uBMqwxXlCKRpBhwxivQXmP12Je";
			const redirectUrl = window.location.origin + "/boards";

			const response = await fetch(
				getApiUrl(
					"/miro/token" +
						"?grant_type=authorization_code&client_id=" +
						clientId +
						"&client_secret=" +
						clientSecret +
						"&code=" +
						authCode +
						"&redirect_uri=" +
						redirectUrl,
				),
				{
					method: "POST",
					headers: {
						Accept: "application/json, application/*+json, application/x-jackson-smile, application/cbor",
					},
				},
			);

			const token = await response.json();
			if (token) {
				Cookies.set("miro_accessToken", token.access_token);
				await fetchBoards();
			}
		} catch (error) {
			console.error(error);
			setIsOpen(false);
			setError(true);
		}
	};

	const fetchBoards = async () => {
		const token = Cookies.get("miro_accessToken");
		try {
			const response = await fetch(
				getApiUrl(
					"/miro/boards?team_id=" +
						teamId +
						"&limit=" +
						BOARD_LIMIT +
						"&offset=" +
						boardsInfo.offset +
						"&sort=last_opened",
				),
				{
					headers: {
						Authorization: "Bearer " + token,
						Accept: "application/json",
					},
				},
			);
			const dataBoards = await response.json();

			if (dataBoards.status === 401) {
				fetchToken();
			} else {
				const { total, offset, data } = dataBoards;
				setBoards(prevBoards =>
					prevBoards ? prevBoards.concat(data) : data,
				);

				setBoardsInfo({ total, offset: offset + BOARD_LIMIT });
			}
		} catch (error) {
			console.error(error);
			setIsOpen(false);
			setError(true);
		}
	};

	useEffect(() => {
		const token = Cookies.get("miro_accessToken");
		if (isOpen) {
			if (!token) {
				fetchToken();
			} else {
				fetchBoards();
			}
		}
	}, []);

	const onClickBoard = (id: string, name: string) => {
		setBoardInfo({ id, name });
		setStage(2);
	};

	const boardsItems = boards?.map(board => {
		const { id, name, picture } = board;
		return (
			<MiroBoardItem
				key={id}
				onClick={() => onClickBoard(id, name)}
				name={name}
				picture={picture}
			/>
		);
	});

	const boardsBtn =
		boards &&
		boards.length >= BOARD_LIMIT &&
		boardsInfo.offset <= boardsInfo.total ? (
			<UiButton onClick={fetchBoards} className={styles.btn} size="sm">
				{boardsInfo.offset >= BOARD_LIMIT * 2 ? (
					<ButtonLoader color="white" />
				) : null}
				{t("miro.boards.showMoreBtn")}
			</UiButton>
		) : null;

	return (
		<>
			<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.M}>
				<h2 className={styles.title}>{t("miro.boards.title")}</h2>
				{!boards ? (
					<Loader />
				) : (
					<>
						<p className={styles.boardsText}>
							{t("miro.boards.text")}
						</p>
						<div className={styles.teamBoards}>
							{t("miro.boards.teamTitle")}{" "}
							<b>{boards[0].team.name}</b>
						</div>
						<div className={styles.boards}>{boardsItems}</div>
						{boardsBtn}
					</>
				)}
			</Modal>
			<ErrorBoardsNotification isOpen={error} setIsOpen={setError} />
		</>
	);
}
