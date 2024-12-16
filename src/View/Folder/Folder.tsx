import React, {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	type MouseEventHandler,
	type RefCallback,
} from "react";
import { foldersApi, type boardsApiV2 } from "shared/apiV2";
import { Icon } from "View/Icon";
import type { IconId } from "View/Icon/Icon";
import {
	UiAdaptiveAccordion,
	type AccordionState,
} from "View/Ui/UiAdaptiveAccordion";
import styles from "./Folder.module.css";
import { FolderItem } from "./FolderItem";
import { useHoverState } from "lib/useHoverState";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { handleClickDetection } from "lib/handleClickDetection";
import { RenameInput, useRenameContext } from "View/Rename";
import { useContextMenuContext } from "View/ContextMenu";
import { useBoardsList } from "App/useBoardsList";
import { useAppContext } from "View/AppContext";
import { useDroppable } from "@dnd-kit/core";
import { useOpenedFoldersContext } from "./OpenedFoldersContext";

type Props = {
	folder: foldersApi.Folder | null;
	handleOpenBoard?: (board: boardsApiV2.Board) => void;
};

// @ts-expect-error TODO add icons for all folder types
const folderIcons: Record<foldersApi.FolderType, IconId> = {
	[foldersApi.FolderType.DRAFTS]: "publicDrafts",
	[foldersApi.FolderType.ROOT]: "myBoards",
	[foldersApi.FolderType.VISITED]: "sharedBoards",
	[foldersApi.FolderType.NESTED]: "Folder",
};

export type FolderRef = {
	openFoldersContainsBoard: (boardId: string) => void;
};

export const Folder = ({ folder, handleOpenBoard }: Props) => {
	const { handlePointerEnter, handlePointerLeave, isHover } = useHoverState();
	const { open } = useContextMenuContext();
	const { boardId: openedFoldersBoardId, folderId: openedFoldersFolderId } =
		useOpenedFoldersContext();
	const { setNewName, setRenamingId, renamingId } = useRenameContext();
	const { board } = useAppContext();
	const boardsList = useBoardsList();
	const boardId = board.getBoardId();
	const accordionRef = useRef<AccordionState>(null);
	const currentBoardRef = useRef<HTMLDivElement>();
	const currentFolderRef = useRef<HTMLButtonElement>(null);
	const { isOver, setNodeRef } = useDroppable({
		id: folder?.id || "unknown",
		data: folder ?? undefined,
	});
	const style = {
		color: isOver ? "green" : undefined,
	};

	const openFoldersContainsBoard = (boardId: string | null) => {
		if (!folder || !boardId) {
			return;
		}
		const isOpen = boardsList.isFolderContainsBoard(folder.id, boardId);

		if (isOpen) {
			accordionRef.current?.open(() => {
				setTimeout(() => {
					if (currentBoardRef.current) {
						console.log("scroll to board", openedFoldersBoardId);
						currentBoardRef.current.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
					}
				}, 0);
			});
		} else {
			accordionRef.current?.close();
		}
	};

	const openFoldersContainsFolder = (folderId: number) => {
		if (!folder || !folderId) {
			return;
		}
		const isOpen = boardsList.isFolderContainsFolder(folder.id, folderId);
		console.log("isOpen", isOpen);
		if (isOpen) {
			accordionRef.current?.open(() => {
				setTimeout(() => {
					if (
						currentFolderRef.current &&
						folder.id === openedFoldersFolderId
					) {
						console.log("scroll to folder", openedFoldersFolderId);
						currentFolderRef.current.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
					}
				}, 0);
			});
		} else {
			accordionRef.current?.close();
		}
	};

	useEffect(() => {
		console.log("open folder useEffect");
		openFoldersContainsBoard(openedFoldersBoardId);
		if (openedFoldersFolderId) {
			openFoldersContainsFolder(openedFoldersFolderId);
		}
	}, [folder?.id, openedFoldersBoardId, openedFoldersFolderId]);

	useEffect(() => {
		if (isOver && !accordionRef.current?.isOpen) {
			accordionRef.current?.open();
		}
	}, [isOver]);

	if (!folder || folder.type === foldersApi.FolderType.TRASH) {
		return null;
	}

	const isRenameAllowed = folder.type === foldersApi.FolderType.NESTED;
	const isRenaming = renamingId === folder.id;

	const handleClick = (toggle: () => void): MouseEventHandler =>
		handleClickDetection(
			() => {
				toggle();
			},
			() => {
				if (!isRenameAllowed) {
					return;
				}
				setNewName(folder.title);
				setRenamingId(folder.id);
			},
		);

	const handleContextMenuOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		open(ev.clientX, ev.clientY, undefined, folder.id);
	};

	return (
		<UiAdaptiveAccordion
			ref={accordionRef}
			elemRef={setNodeRef}
			renderHeader={({ toggle, isOpen }) => (
				<button
					ref={currentFolderRef}
					style={style}
					className={styles.header}
					onClick={handleClick(toggle)}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
					onContextMenu={handleContextMenuOpen}
				>
					<span className={styles.icon}>
						{!isHover && (
							<Icon
								width={20}
								height={20}
								iconName={folderIcons[folder.type]}
							/>
						)}
						{isHover && (
							<Icon
								width={20}
								height={20}
								iconName={isOpen ? "ArrowUp" : "ArrowDown"}
							/>
						)}
					</span>
					{isRenaming ? <RenameInput /> : <span>{folder.title}</span>}
				</button>
			)}
			renderContent={() => (
				<div className={styles.contentWrapper}>
					<div className={styles.content}>
						{folder.items.length > 0 ? (
							<TransitionGroup component={null}>
								{folder.items.map((item, idx) => (
									<CSSTransition
										key={item.id}
										timeout={500}
										classNames={{
											enter: styles.fadeEnter,
											enterActive: styles.fadeEnterActive,
											exit: styles.fadeExit,
											exitActive: styles.fadeExitActive,
										}}
									>
										{item.itemType === "board" ? (
											<FolderItem
												ref={el => {
													if (
														el &&
														item.id === boardId
													) {
														currentBoardRef.current =
															el;
													}
												}}
												folder={folder}
												key={item.id}
												board={item}
												handleOpenBoard={
													handleOpenBoard
												}
											/>
										) : (
											<Folder
												key={item.id}
												folder={item}
											/>
										)}
									</CSSTransition>
								))}
							</TransitionGroup>
						) : (
							<span className={styles.noContent}>
								No boards available yet
							</span>
						)}
					</div>
				</div>
			)}
		/>
	);
};

Folder.displayName = "Folder";
