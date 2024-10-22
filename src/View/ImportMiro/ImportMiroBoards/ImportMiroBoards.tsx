import { useEffect, useState } from "react";
import { MiroBoards } from "./MiroBoards/MiroBoards";
import React from "react";
import { ImportBoardItem } from "./ImportBoardItem";
import { useSearchParams } from "react-router-dom";
import { IMiroBoard, IMiroBoardItem } from "./MiroBoards/MiroBoardsModels";
import { ErrorNotification } from "./Notifications";
import { useModal } from "View/Modal/ModalProvider";

export interface MiroItemsInfo {
	cursor: {
		items: string;
		connectors: string;
	};
	total: {
		items: number;
		connectors: number;
	};
}

export function ImportMiroBoards(): React.ReactElement | null {
	const { setModalData, showModal } = useModal();
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isClipboard = searchParams.get("clipboard");
	const isOpenMiroBoards = codeSearch && teamIdSearch && !isClipboard;

	const [stage, setStage] = useState<number>(1);
	const [open, setOpen] = useState<boolean>(!!isOpenMiroBoards);
	const [boardInfo, setBoardInfo] = useState<Pick<IMiroBoard, "id" | "name">>(
		{
			id: "",
			name: "",
		},
	);

	const [itemsInfo, setItemsInfo] = useState<MiroItemsInfo>({
		cursor: { items: "", connectors: "" },
		total: { items: 0, connectors: 0 },
	});

	const [boardItems, setBoardItems] = useState<IMiroBoardItem[]>([]);

	const loadingPercentage =
		Math.ceil(
			(boardItems.length /
				(itemsInfo.total.items + itemsInfo.total.connectors)) *
				100,
		) || 0;

	useEffect(() => {
		setModalData?.(loadingPercentage);
	}, [setModalData]);

	return (
		<>
			<ErrorNotification setStage={setStage} setModalOpen={setOpen} />
			{stage === 1 ? (
				<MiroBoards
					isOpen={open}
					setIsOpen={setOpen}
					setStage={setStage}
					setBoardInfo={setBoardInfo}
				/>
			) : stage === 2 ? (
				<ImportBoardItem
					isOpen={open}
					setIsOpen={setOpen}
					boardInfo={boardInfo}
					boardItems={boardItems}
					setBoardItems={setBoardItems}
					itemsInfo={itemsInfo}
					setItemsInfo={setItemsInfo}
					loadingPercentage={loadingPercentage}
				/>
			) : null}
		</>
	);
}
