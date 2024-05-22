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
			const clientId = "3458764589599848573";
			const clientSecret = "ufmdVcxamXfkjHHeS8Bv1QPCxrUN63PB";
			const redirectUrl = import.meta.env.BASE_URL + "/boards/:boardId/";

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
				const response = await fetch(
					"https://api.miro.com/v2/boards?team_id=" + teamId,
					{
						headers: {
							Authorization: "Bearer " + data.access_token,
							Accept: "application/json",
						},
					},
				);
				const dataBoards = await response.json();
				setBoards(dataBoards);
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchData();
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
