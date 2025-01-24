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

const isFolder = (
	item: unknown,
): item is foldersApi.NestedFolder & { parentFolderId: number } =>
	typeof item === "object" &&
	item !== null &&
	(("itemType" in item &&
		(item as { itemType?: string }).itemType === "folder") ||
		("id" in item && typeof (item as { id: number }).id === "number"));

export function FoldersDndContext({ children }: Props) {
	const boardsList = useBoardsList();
	const pointerSensor = useSensor(PointerSensor, {
		activationConstraint: {
			delay: 300,
			distance: 5,
			tolerance: 10,
		},
	});

	const sensors = useSensors(pointerSensor);
	const handleDragEnd = async (evt: DragEndEvent) => {
		const draggable = evt.active.data.current;
		const target = evt.over?.data.current;
		console.log(draggable, target, isBoard(draggable));

		if (
			(!isBoard(draggable) && !isFolder(draggable)) ||
			!target ||
			draggable.id === target.id ||
			draggable.parentFolderId === target.id
		) {
			return;
		}
		if (isFolder(target)) {
			console.log(
				`remove ${draggable.id} from folder ${draggable.parentFolderId}`,
			);
			await boardsList.removeItemFromFolder(
				draggable.parentFolderId,
				draggable.id,
			);

			await boardsList.addItemToFolder(target.id, draggable);
		} else if (isBoard(target)) {
			await boardsList.removeItemFromFolder(
				draggable.parentFolderId,
				draggable.id,
			);

			const targetFolderId = target.parentFolderId;
			const targetIdx = boardsList.getItemIndexInFolder(
				targetFolderId,
				target.id,
			);
			await boardsList.addItemToFolder(
				targetFolderId,
				draggable,
				targetIdx ? targetIdx + 1 : undefined,
			);
		}
	};

	const handleDragOver = (evt: DragOverEvent) => {
		const target = evt.over?.data.current;
		// if (isBoard(target)) {
		// 	const targetIdx = boardsList.getItemIndexInFolder(
		// 		target.parentFolderId,
		// 		target.id,
		// 	);
		// }
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
