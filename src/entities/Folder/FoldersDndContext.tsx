import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBoardsList } from "App/useBoardsList";
import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import { foldersApi } from "shared/apiV2";

type Props = PropsWithChildren<{}>;

type Board = foldersApi.NestedBoard & { parentFolderId: number };
type Folder = foldersApi.NestedFolder & { parentFolderId: number };

const isBoard = (item: unknown): item is Board =>
  typeof item === "object" &&
  item !== null &&
  (item as { itemType?: string }).itemType === "board";

const isFolder = (item: unknown): item is Folder =>
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
  const [activeItem, setActiveItem] = useState<Board | Folder | null>(null);

  const sensors = useSensors(pointerSensor);

  const handleDragStart = (evt: DragStartEvent) => {
    const draggable = evt.active.data.current;
    if (isBoard(draggable) || isFolder(draggable)) {
      boardsList.setDraggableDndItem(draggable);
      setActiveItem(draggable);
    }
  };

  const handleDragEnd = async (evt: DragEndEvent) => {
    const target = evt.over?.data.current;

    boardsList.setDraggableDndItem(null);
    boardsList.setOverDndItem(null);
    if (
      (!isBoard(activeItem) && !isFolder(activeItem)) ||
      !target ||
      activeItem.id === target.id
    ) {
      setActiveItem(null);
      await boardsList.loadBoards();
      return;
    }
    if (isFolder(target)) {
      if (
        target.type === foldersApi.FolderType.VISITED ||
        target.type === foldersApi.FolderType.DRAFTS
      ) {
        setActiveItem(null);
        await boardsList.loadBoards();
        return;
      }
      await boardsList.removeItemFromFolder(
        activeItem.parentFolderId,
        activeItem.id,
      );
      await boardsList.addItemToFolder(target.id, activeItem, 0);
    } else if (isBoard(target)) {
      const targetOrder = target.order;
      await boardsList.removeItemFromFolder(
        activeItem.parentFolderId,
        activeItem.id,
      );
      const targetFolderId = target.parentFolderId;
      const folderInfo = boardsList.getFolder(targetFolderId);

      if (
        folderInfo?.type === foldersApi.FolderType.VISITED ||
        folderInfo?.type === foldersApi.FolderType.DRAFTS
      ) {
        setActiveItem(null);
        await boardsList.loadBoards();
        return;
      }
      await boardsList.addItemToFolder(
        targetFolderId,
        activeItem,
        targetOrder + 1,
      );
    }
    setActiveItem(null);
    await boardsList.loadBoards();
  };

  const handleDragOver = (evt: DragOverEvent) => {
    const target = evt.over?.data.current;
    if (isBoard(target) || isFolder(target)) {
      boardsList.setOverDndItem(target);
    } else {
      boardsList.setOverDndItem(null);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
