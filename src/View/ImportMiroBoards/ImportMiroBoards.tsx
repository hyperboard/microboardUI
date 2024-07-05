import { useState } from "react";
import { MiroBoards } from "./MiroBoards/MiroBoards";
import React from "react";
import { ImportBoardItem } from "./ImportBoardItem";
import { App } from "App";

interface IImportMiroBoards {
	isOpen: boolean | null;
	app: App;
}

export function ImportMiroBoards({
	isOpen,
	app,
}: IImportMiroBoards): React.ReactElement | null {
	const [stage, setStage] = useState<number>(1);
	const [open, setOpen] = useState<boolean | null>(isOpen);
	const [boardId, setBoardId] = useState<string>("");

	return stage === 1 && open ? (
		<MiroBoards
			isOpen={open}
			setIsOpen={setOpen}
			setStage={setStage}
			setBoardId={setBoardId}
		/>
	) : stage === 2 ? (
		<ImportBoardItem
			isOpen={open}
			setIsOpen={setOpen}
			boardId={boardId}
			app={app}
		/>
	) : null;
}
