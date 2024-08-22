import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import styles from "../ImportMiroBoards.module.css";
import { useLocation } from "react-router-dom";
import { IMiroBoard, IMiroBoards } from "./MiroBoardsModels";
import { MiroBoardItem } from "./MiroBoardItem";
import Cookies from "js-cookie";
import { getApiUrl } from "Config";
import { Modal } from "shared/ui-lib/Modal";
import { ModalSize } from "shared/ui-lib/Modal/Modal";
import { Loader } from "shared/ui-lib/Loader/Loader";
import { Loader as ButtonLoader } from "shared/ui-lib/Button/Loader";
import { UiButton } from "View/Ui/UiButton";

interface IMiroBoardsProps {
	isOpen: boolean | null;
	setIsOpen: (isOpen: boolean) => void;
	setStage: (stage: number) => void;
	setBoardId: (id: string) => void;
}

export function MiroBoards({
	isOpen,
	setIsOpen,
	setStage,
	setBoardId,
}: IMiroBoardsProps): React.ReactElement {
	const { t } = useTranslation();
	const location = useLocation();
	const teamId = new URLSearchParams(location.search).get("team_id");
	const authCode = new URLSearchParams(location.search).get("code");
	const [boards, setBoards] = useState<IMiroBoard[] | null>(null);
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
			const redirectUrl = window.location.origin + "/boards/:boardId/";

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
		} catch (e) {
			console.error(e);
		}
	};

	const fetchBoards = async () => {
		const token = Cookies.get("miro_accessToken");
		const response = await fetch(
			"https://api.miro.com/v2/boards?team_id=" +
				teamId +
				"&limit=" +
				BOARD_LIMIT +
				"&offset=" +
				boardsInfo.offset,
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

	const onClickBoard = (id: string) => {
		setBoardId(id);
		setStage(2);
	};

	if (!boards) {
		return (
			<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.M}>
				<h2 className={styles.title}>{t("miro.boardsTitle")}</h2>
				<Loader />
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size={ModalSize.M}>
			<h2 className={styles.title}>{t("miro.boardsTitle")}</h2>
			<div className={styles.boards}>
				{boards?.map(board => {
					const { id, name, picture } = board;
					return (
						<MiroBoardItem
							key={id}
							onClick={() => onClickBoard(id)}
							name={name}
							picture={picture}
						/>
					);
				})}
			</div>
			{boards.length >= BOARD_LIMIT &&
			boardsInfo.offset <= boardsInfo.total ? (
				<UiButton
					onClick={fetchBoards}
					className={styles.btn}
					size="sm"
				>
					{boardsInfo.offset >= BOARD_LIMIT * 2 ? (
						<ButtonLoader color="white" />
					) : null}
					{t("miro.showMoreBtn")}
				</UiButton>
			) : null}
		</Modal>
	);
}
