import { useBoardsList } from "App/useBoardsList";
import React from "react";
import { Icon } from "shared/ui-lib/Icon";
import styles from "./DraggingItem.module.css";
import { folderIcons } from "./Folder";

export function DraggingItem() {
  const boardsList = useBoardsList();
  const itemInfo = boardsList.getDraggableDndItem();

  if (!itemInfo) {
    return null;
  }

  const boardItem =
    itemInfo.itemType === "board"
      ? boardsList.getBoardInfo(itemInfo.id as string)
      : null;

  if (boardItem) {
    return (
      <div className={styles.item}>
        <Icon
          width={20}
          height={20}
          iconName={boardItem.isPublic ? "EmbedBoardIcon" : "lock"}
        />
        <span>{boardItem.title}</span>
      </div>
    );
  }

  const folderItem =
    itemInfo.itemType === "folder"
      ? boardsList.getFolder(itemInfo.id as number)
      : null;

  if (folderItem) {
    return (
      <div className={styles.item}>
        <Icon width={20} height={20} iconName={folderIcons[folderItem.type]} />
        <span>{folderItem.title}</span>
      </div>
    );
  }

  return null;
}
