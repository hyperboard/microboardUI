import { useSortable } from "@dnd-kit/sortable";
import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { useContextMenuContext } from "features/ContextMenu";
import { RenameInput, useRenameContext } from "features/Rename";
import React, {
  forwardRef,
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEventHandler,
  type SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { boardsApi, foldersApi } from "shared/api";
import { handleClickDetection } from "shared/lib/handleClickDetection";
import { Icon } from "shared/ui-lib/Icon";
import { DragPlaceholder } from "./DragPlaceholder";
import styles from "./FolderItem.module.css";

type Props = {
  board: foldersApi.NestedBoard;
  folder?: foldersApi.Folder | foldersApi.NestedFolder;
  handleOpenBoard?: (board: boardsApi.Board) => void;
};

export const FolderItem = forwardRef<HTMLDivElement, Props>(
  ({ board, folder, handleOpenBoard }, ref) => {
    const { app, board: currentBoard } = useAppContext();
    const navigate = useNavigate();
    const { open } = useContextMenuContext();
    const { setRenamingId, setNewName, renamingId } = useRenameContext();
    const account = useAccount();
    const itemRef = useRef<HTMLDivElement | null>(null);

    const { attributes, listeners, transform, setNodeRef, isDragging, isOver } =
      useSortable({
        id: board.id,
        data: { ...board, parentFolderId: folder?.id },
      });

    const style: CSSProperties | undefined = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 10000,
        }
      : undefined;

    const currentBoardId = currentBoard?.getBoardId();
    const isActive = currentBoardId === board.id;
    const isRenaming = board.id === renamingId;
    const hasOwnerRights = account.permissions.checkPermissions(
      "owns",
      "boards",
      board.id,
    );

    const handleClick = useCallback(
      handleClickDetection(
        async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (handleOpenBoard) {
            return handleOpenBoard(board);
          }
          await app.openBoard(board.id);
          navigate(`/boards/${board.id}`);
        },
        (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (!hasOwnerRights) {
            return;
          }
          setRenamingId(board.id);
          setNewName(board.title);
        },
        300,
      ),
      [board],
    );

    const stopPropagation = (ev: SyntheticEvent) => {
      ev.stopPropagation();
    };

    const handleContextMenuOpen: MouseEventHandler = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      open(ev.clientX, ev.clientY, board.id, folder?.id);
    };

    return (
      <>
        <div
          // style={style}
          ref={(node) => {
            itemRef.current = node;
            if (node) {
              setNodeRef(node);
            }
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={styles.wrapper}
          {...listeners}
          {...attributes}
        >
          {!isDragging && (
            <button
              className={styles.contextMenuBtn}
              onClick={handleContextMenuOpen}
              onMouseDown={stopPropagation}
              onMouseUp={stopPropagation}
            >
              <Icon width={16} height={16} iconName="ThreeDots" />
            </button>
          )}
          <button
            className={clsx(
              styles.item,
              {
                [styles.active]: isActive,
                [styles.dragging]: isDragging,
              },
              isOver && styles.disableHover,
            )}
            onContextMenu={handleContextMenuOpen}
            onClick={handleClick}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
          >
            <span className={styles.icon}>
              <Icon
                width={20}
                height={20}
                iconName={board.isPublic ? "EmbedBoardIcon" : "lock"}
              />
            </span>
            {isRenaming ? (
              <RenameInput />
            ) : (
              <span className={styles.title}>{board.title}</span>
            )}
          </button>
        </div>
        {isOver && <DragPlaceholder />}
      </>
    );
  },
);

FolderItem.displayName = "FolderItem";
