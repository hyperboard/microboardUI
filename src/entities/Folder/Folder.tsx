import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { useAppContext } from "features/AppContext";
import { useContextMenuContext } from "features/ContextMenu";
import { RenameInput, useRenameContext } from "features/Rename";
import { useSidePanelContext } from "features/SidePanel";
import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { foldersApi, type boardsApi } from "shared/api";
import { FolderType } from "shared/api/folders";
import { handleClickDetection } from "shared/lib/handleClickDetection";
import { Icon } from "shared/ui-lib/Icon";
import {
  UiAdaptiveAccordion,
  type AccordionState,
} from "shared/ui-lib/UiAdaptiveAccordion";
import { DragPlaceholder } from "./DragPlaceholder";
import styles from "./Folder.module.css";
import { FolderItem } from "./FolderItem";
import { useOpenedFoldersContext } from "./OpenedFoldersContext";

type Props = {
  folder: foldersApi.Folder | null;
  parentFolderId?: number;
  handleOpenBoard?: (board: boardsApi.Board) => void;
  accordionClassName?: string;
  zIndex?: number;
};

// @ts-expect-error TODO add icons for all folder types
export const folderIcons: Record<foldersApi.FolderType, IconId> = {
  [foldersApi.FolderType.DRAFTS]: "publicDrafts",
  [foldersApi.FolderType.ROOT]: "myBoards",
  [foldersApi.FolderType.VISITED]: "sharedBoards",
  [foldersApi.FolderType.NESTED]: "Folder",
};

export type FolderRef = {
  openFoldersContainsBoard: (boardId: string) => void;
};

export const Folder = ({
  folder,
  handleOpenBoard,
  accordionClassName,
  zIndex = 0,
  parentFolderId,
}: Props) => {
  const { open, close } = useContextMenuContext();
  const { t } = useTranslation();
  const { setNewName, setRenamingId, renamingId } = useRenameContext();
  const { app } = useAppContext();
  const { isOpen: isSidePanelOpen } = useSidePanelContext();
  const boardsList = useBoardsList();
  const boardId = app.getBoard()?.getBoardId();
  const accordionRef = useRef<AccordionState>(null);
  const currentBoardRef = useRef<HTMLDivElement>(null);
  const currentFolderRef = useRef<HTMLButtonElement>(null);
  const { id, foldersRefState } = useOpenedFoldersContext();
  const [, setOpenedByDragging] = useState(false);
  const [, setOriginalPosition] = useState<
    Record<"left" | "top" | "width" | "height", number>
  >({ left: 0, top: 0, width: 0, height: 0 });
  const { isOver, setNodeRef } = useSortable({
    id: folder?.id || "unknown",
    data: folder ?? undefined,
    disabled:
      folder?.type !== foldersApi.FolderType.ROOT &&
      folder?.type !== foldersApi.FolderType.NESTED,
  });
  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefHeader,
    transform,
    isDragging,
  } = useSortable({
    id: `header-${folder?.id ?? 0}`,
    data: { ...folder, parentFolderId },
    disabled:
      folder?.type !== foldersApi.FolderType.ROOT &&
      folder?.type !== foldersApi.FolderType.NESTED,
  });

  const isOverTimerRef = useRef<NodeJS.Timeout>(setTimeout(() => {}));
  const itemRef = useRef<HTMLDivElement | null>(null);

  const style: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10000,
      }
    : undefined;

  const openFolders = (id: string | number | null) => {
    if (!id) {
      return;
    }

    let folderIds;
    if (typeof id === "string") {
      folderIds = boardsList.getPathToBoard(id);
    }

    if (typeof id === "number") {
      folderIds = boardsList.getPathToFolder(id);
    }

    if (!folderIds) {
      return;
    }

    if (folder?.id && folderIds.includes(folder?.id)) {
      accordionRef.current?.open();
    }

    setTimeout(() => {
      if (currentBoardRef.current && folderIds.at(-1) === folder?.id) {
        currentBoardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });

        foldersRefState?.scrollTo({ left: 0, behavior: "instant" });
      }
    }, 500);
  };

  useEffect(() => {
    if (id) {
      return openFolders(id);
    }
  }, [id, isSidePanelOpen]);

  useEffect(() => {
    if (isOver && !accordionRef.current?.isOpen) {
      clearTimeout(isOverTimerRef.current);
      isOverTimerRef.current = setTimeout(() => {
        setOpenedByDragging(true);

        accordionRef.current?.open();
      }, 800);
    }

    // if (overFolderId !== folder?.id && !isOver && openedByDragging) {
    // 	accordionRef.current?.close();
    // }

    if (!isOver) {
      null;
      clearTimeout(isOverTimerRef.current);
    }

    return () => {
      clearTimeout(isOverTimerRef.current);
    };
  }, [isOver]);

  useEffect(() => {
    if (
      (folder?.type === foldersApi.FolderType.DRAFTS ||
        folder?.type === foldersApi.FolderType.ROOT ||
        folder?.type === foldersApi.FolderType.VISITED) &&
      folder?.items.length > 0
    ) {
      if (isSidePanelOpen) {
        accordionRef.current?.open();
      }
    }
  }, [isSidePanelOpen]);

  const calcOriginalPosition = () => {
    if (isDragging && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setOriginalPosition({
        top: rect.y,
        left: rect.x,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    calcOriginalPosition();
    document.addEventListener("scroll", calcOriginalPosition, true);

    if (isDragging) {
      accordionRef.current?.close();
    }
    return () => {
      document.removeEventListener("scroll", calcOriginalPosition, true);
    };
  }, [isDragging]);

  if (!folder || folder.type === foldersApi.FolderType.TRASH) {
    return null;
  }

  const isRenameAllowed = folder.type === foldersApi.FolderType.NESTED;
  const isRenaming = renamingId === folder.id;

  const handleClick = (toggle: () => void): MouseEventHandler =>
    handleClickDetection(
      () => {
        toggle();
        close();
      },
      () => {
        if (!isRenameAllowed) {
          return;
        }
        setNewName(folder.title);
        setRenamingId(folder.id);
      },
      200,
    );

  const handleContextMenuOpen: MouseEventHandler = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    open(ev.clientX, ev.clientY, undefined, folder.id);
  };

  const stopPropagation = (ev: SyntheticEvent) => {
    ev.stopPropagation();
  };

  return (
    <SortableContext
      items={folder.items.map(({ id }) => id)}
      strategy={verticalListSortingStrategy}
    >
      <UiAdaptiveAccordion
        className={clsx(accordionClassName, styles.folder)}
        style={{ zIndex, ...style }}
        ref={accordionRef}
        elemRef={setNodeRef}
        renderHeader={({ toggle, isOpen }) => (
          <div
            className={styles.wrapper}
            {...listeners}
            {...attributes}
            ref={(node) => {
              setNodeRefHeader(node);
              itemRef.current = node;
            }}
          >
            {folder.type !== FolderType.VISITED && (
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
              ref={currentFolderRef}
              className={clsx(styles.header, isOver && styles.over)}
              onClick={handleClick(toggle)}
              onContextMenu={handleContextMenuOpen}
            >
              <span className={styles.icon}>
                <Icon
                  width={20}
                  height={20}
                  iconName={isOpen ? "ArrowUp" : "ArrowDown"}
                />
                <Icon
                  width={20}
                  height={20}
                  iconName={folderIcons[folder.type]}
                />
              </span>
              {isRenaming ? <RenameInput /> : <span>{folder.title}</span>}
            </button>
          </div>
        )}
        renderContent={() => (
          <div className={styles.contentWrapper}>
            <div className={styles.content}>
              {boardsList.getOverDndItem()?.id === folder.id && (
                <DragPlaceholder />
              )}
              {folder.items.length > 0 ? (
                <>
                  {folder.items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      {item.itemType === "board" ? (
                        <FolderItem
                          ref={(el) => {
                            if (el && item.id === boardId) {
                              currentBoardRef.current = el;
                            }
                          }}
                          folder={folder}
                          board={item}
                          handleOpenBoard={handleOpenBoard}
                        />
                      ) : (
                        <Folder
                          parentFolderId={folder.id}
                          zIndex={zIndex + 1}
                          folder={item}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <span className={styles.noContent}>
                  {t("sidePanel.folders.notAvailable")}
                </span>
              )}
            </div>
          </div>
        )}
      />
    </SortableContext>
  );
};

Folder.displayName = "Folder";
