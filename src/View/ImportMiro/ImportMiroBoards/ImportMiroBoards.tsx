import { useState } from "react";
import { MiroBoards } from "./MiroBoards/MiroBoards";
import React from "react";
import { ImportBoardItem } from "./ImportBoardItem";
import { App } from "App";
import { useSearchParams } from "react-router-dom";
import { IMiroBoard } from "./MiroBoards/MiroBoardsModels";

interface IImportMiroBoards {
	app: App;
}

export function ImportMiroBoards({
	app,
}: IImportMiroBoards): React.ReactElement | null {
	const [searchParams] = useSearchParams();
	const codeSearch = searchParams.get("code");
	const teamIdSearch = searchParams.get("team_id");
	const isOpenMiroBoards = codeSearch && teamIdSearch;

	const [stage, setStage] = useState<number>(1);
	const [open, setOpen] = useState<boolean | null>(!!isOpenMiroBoards);
	const [boardInfo, setBoardInfo] = useState<Pick<IMiroBoard, "id" | "name">>(
		{
			id: "",
			name: "",
		},
	);

	return stage === 1 ? (
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
			app={app}
		/>
	) : null;
}
