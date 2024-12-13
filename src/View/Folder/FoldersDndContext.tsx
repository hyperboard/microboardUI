import {
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import { useBoardsList } from "App/useBoardsList";
import type { PropsWithChildren } from "react";
import React from "react";
import type { foldersApi } from "shared/apiV2";

type Props = PropsWithChildren<{}>;

const isBoard = (
	item: unknown,
): item is foldersApi.NestedBoard & { parentFolderId: number } =>
	typeof item === "object" &&
	item !== null &&
	(item as { itemType?: string }).itemType === "board";

const isFolder = (item: unknown): item is foldersApi.NestedFolder =>
	typeof item === "object" &&
	item !== null &&
	(item as { itemType?: string }).itemType === "folder";

export function FoldersDndContext({ children }: Props) {
	const boardsList = useBoardsList();
	const pointerSensor = useSensor(PointerSensor, {
		activationConstraint: {
			delay: 300,
			distance: 5,
		},
	});

	const sensors = useSensors(pointerSensor);
	// const handleDragStart = (evt: DragStartEvent) => {
	// 	console.log(evt);
	// 	const board = evt.active.data;
	// 	if (!isBoard(board)) {
	// 		return;
	// 	}

	// 	// setDraggedBoard(board);
	// };
	const handleDragEnd = async (evt: DragEndEvent) => {
		// setDraggedBoard(null);
		console.log(evt);
		const board = evt.active.data.current;
		const targetFolderId = evt.over?.id;
		if (
			!isBoard(board) ||
			!targetFolderId ||
			board.parentFolderId === targetFolderId
		) {
			return;
		}
		await boardsList.removeBoardFromFolder(board.parentFolderId, board.id);
		await boardsList.addBoardToFolder(+targetFolderId, board.id);
	};

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			{children}
		</DndContext>
	);
}
