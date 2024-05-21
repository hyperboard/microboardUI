import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import styles from "./MiroBoards.module.css";
import { useLocation } from "react-router-dom";
import { IMiroBoards } from "./MiroBoardsModels";
import { MiroBoardItem } from "./MiroBoardItem";

interface IMiroBoardsProps {
	isOpen: boolean | null;
}

export function MiroBoards({ isOpen = false }: IMiroBoardsProps) {
	const { t } = useTranslation();
	const location = useLocation();
	const teamId = new URLSearchParams(location.search).get("team_id");
	const [boards, setBoards] = useState<IMiroBoards | null>(null);
	const [open, setOpen] = useState<boolean | null>(isOpen);

	const headers = {
		Authorization:
			"Bearer eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_Znh2g1pAoIdiAkV-lmHhZST83Ik",
		Accept: "application/json",
	};

	const fetchBoards = async () => {
		try {
			const response = await fetch(
				"https://api.miro.com/v2/boards?team_id=" + teamId,
				{ headers },
			);
			const data = await response.json();
			console.log(data);
			setBoards(data);
			return data;
		} catch (error) {
			console.error(error as Error);
		}
	};

	const fetchBoardsItem = async (id: string) => {
		try {
			const response = await fetch(
				"https://api.miro.com/v2/boards/" + id + "/items",
				{ headers },
			);
			const data = await response.json();
			console.log("data", data);
			return data;
		} catch (error) {
			console.error(error as Error);
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchBoards();
		}
	}, []);

	const onClickBoard = (id: string) => fetchBoardsItem(id);
	const onCloseModal = () => setOpen(false);

	return (
		<div
			className={`${styles.modal} ${open ? styles.open : null}`}
			onClick={onCloseModal}
		>
			<div className={styles.wr} onClick={e => e.stopPropagation()}>
				<h2>{t("miro.boardsTitle")}</h2>
				<div className={styles.boards}>
					{boards?.data.map(board => {
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
			</div>
		</div>
	);
}
