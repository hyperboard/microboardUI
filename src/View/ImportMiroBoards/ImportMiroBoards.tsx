import { useState } from "react";
import { MiroBoards } from "./MiroBoards/MiroBoards";
import React from "react";
import { ImportBoardItem } from "./ImportBoardItem";

interface IImportMiroBoards {
	isOpen: boolean | null;
}

export function ImportMiroBoards({ isOpen }: IImportMiroBoards) {
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
	) : (
		<ImportBoardItem isOpen={open} setIsOpen={setOpen} boardId={boardId} />
	);
}
