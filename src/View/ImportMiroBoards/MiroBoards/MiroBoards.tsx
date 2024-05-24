import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import styles from "./MiroBoards.module.css";
import { useLocation } from "react-router-dom";
import { IMiroBoards } from "./MiroBoardsModels";
import { MiroBoardItem } from "./MiroBoardItem";
import Cookies from "js-cookie";

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
}: IMiroBoardsProps) {
	const { t } = useTranslation();
	const location = useLocation();
	const teamId = new URLSearchParams(location.search).get("team_id");
	const authCode = new URLSearchParams(location.search).get("code");
	const [boards, setBoards] = useState<IMiroBoards | null>(null);

	const fetchData = async () => {
		try {
			const clientId = import.meta.env.MIRO_CLIENT_ID;
			const clientSecret = import.meta.env.MIRO_CLIENT_SECRET;
			const redirectUrl = window.location.origin + "/boards/:boardId/";

			const response = await fetch(
				"https://api.miro.com/v1/oauth/token?grant_type=authorization_code&client_id=" +
					clientId +
					"&client_secret=" +
					clientSecret +
					"&code=" +
					authCode +
					"&redirect_uri=" +
					redirectUrl,
				{
					method: "POST",
					headers: {
						Accept: "application/json, application/*+json, application/x-jackson-smile, application/cbor",
					},
				},
			);

			const data = await response.json();
			if (data) {
				Cookies.set("miro_accessToken", data.access_token);
				await fetchBoards();
			}
		} catch (e) {
			console.error(e);
		}
	};

	const fetchBoards = async () => {
		const token = Cookies.get("miro_accessToken");
		const response = await fetch(
			"https://api.miro.com/v2/boards?team_id=" + teamId,
			{
				headers: {
					Authorization: "Bearer " + token,
					Accept: "application/json",
				},
			},
		);
		const dataBoards = await response.json();
		if (dataBoards.status === 401) {
			fetchData();
		} else {
			setBoards(dataBoards);
		}
	};

	useEffect(() => {
		const token = Cookies.get("miro_accessToken");
		if (isOpen) {
			if (!token) {
				fetchData();
			} else {
				fetchBoards();
			}
		}
	}, []);

	const onClickBoard = (id: string) => {
		setBoardId(id);
		setStage(2);
	};
	const onCloseModal = () => setIsOpen(false);

	return (
		<div
			className={`${styles.modal} ${isOpen ? styles.open : null}`}
			onClick={onCloseModal}
		>
			<div className={styles.wr} onClick={e => e.stopPropagation()}>
				<h2>{t("miro.boardsTitle")}</h2>
				<div className={styles.boards}>
					{boards
						? boards?.data.map(board => {
								const { id, name, picture } = board;
								return (
									<MiroBoardItem
										key={id}
										onClick={() => onClickBoard(id)}
										name={name}
										picture={picture}
									/>
								);
						  })
						: "Loading..."}
				</div>
			</div>
		</div>
	);
}
