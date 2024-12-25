import {
	closestCenter,
	DndContext,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
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
	const handleDragEnd = async (evt: DragEndEvent) => {
		const board = evt.active.data.current;
		const target = evt.over?.data.current;

		console.log(evt.over?.rect);
		console.log(evt.active);

		if (!isBoard(board) || !target) {
			return;
		}
		await boardsList.removeItemFromFolder(board.parentFolderId, board.id);
		if (isFolder(target)) {
			await boardsList.addItemToFolder(target.id, board);
		} else if (isBoard(target)) {
			const targetFolderId = target.parentFolderId;
			const targetIdx = boardsList.getItemIndexInFolder(
				targetFolderId,
				target.id,
			);
			await boardsList.addItemToFolder(
				targetFolderId,
				board,
				targetIdx ? targetIdx + 1 : undefined,
			);
		}

		// await boardsList.removeBoardFromFolder(board.parentFolderId, board.id);
		// await boardsList.addBoardToFolder(+targetFolderId, board.id);
	};

	const handleDragOver = (evt: DragOverEvent) => {
		const target = evt.over?.data.current;
		if (isBoard(target)) {
			const targetIdx = boardsList.getItemIndexInFolder(
				target.parentFolderId,
				target.id,
			);
		}
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			onDragOver={handleDragOver}
			sensors={sensors}
			onDragEnd={handleDragEnd}
		>
			{children}
		</DndContext>
	);
}
