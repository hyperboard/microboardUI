import { useDraggable } from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { handleClickDetection } from "lib/handleClickDetection";
import React, {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type MouseEventHandler,
	type SyntheticEvent,
} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { foldersApi, type boardsApiV2 } from "shared/apiV2";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { Icon } from "View/Icon";
import type { IconId } from "View/Icon/Icon";
import { RenameInput, useRenameContext } from "View/Rename";
import { useSidePanelContext } from "View/SidePanel";
import {
	UiAdaptiveAccordion,
	type AccordionState,
} from "View/Ui/UiAdaptiveAccordion";
import { DraggingItem } from "./DraggingItem";
import { DraggingWrapper } from "./DraggingWrapper";
import styles from "./Folder.module.css";
import { FolderItem } from "./FolderItem";
import { useFoldersContext } from "./FoldersContext";
import { useOpenedFoldersContext } from "./OpenedFoldersContext";
import { FolderType } from "shared/apiV2/folders";

type Props = {
	folder: foldersApi.Folder | null;
	parentFolderId?: number;
	handleOpenBoard?: (board: boardsApiV2.Board) => void;
	accordionClassName?: string;
	zIndex?: number;
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

export const Folder = ({
	folder,
	handleOpenBoard,
	accordionClassName,
	zIndex = 0,
	parentFolderId,
}: Props) => {
	const { open, close } = useContextMenuContext();
	const { boardId: openedFoldersBoardId, folderId: openedFoldersFolderId } =
		useOpenedFoldersContext();
	const { setNewName, setRenamingId, renamingId } = useRenameContext();
	const { board } = useAppContext();
	const { isOpen: isSidePanelOpen } = useSidePanelContext();
	const boardsList = useBoardsList();
	const boardId = board.getBoardId();
	const accordionRef = useRef<AccordionState>(null);
	const currentBoardRef = useRef<HTMLDivElement>();
	const currentFolderRef = useRef<HTMLButtonElement>(null);
	const [openedByDragging, setOpenedByDragging] = useState(false);
	const { overFolderId, setOverFolderId } = useFoldersContext();
	const [originalPosition, setOriginalPosition] = useState<
		Record<"left" | "top" | "width" | "height", number>
	>({ left: 0, top: 0, width: 0, height: 0 });
	const { isOver, setNodeRef } = useSortable({
		id: folder?.id || "unknown",
		data: folder ?? undefined,
		disabled: folder?.type === foldersApi.FolderType.VISITED,
	});
	const {
		attributes,
		listeners,
		setNodeRef: setNodeRefHeader,
		transform,
		isDragging,
	} = useDraggable({
		id: folder?.id ?? 0,
		data: { ...folder, parentFolderId },
	});
	const isOverTimerRef = useRef<NodeJS.Timeout>();
	const itemRef = useRef<HTMLDivElement | null>(null);

	const style: CSSProperties | undefined = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				zIndex: 10000,
			}
		: undefined;

	const openFoldersContainsBoard = (boardId: string | null) => {
		if (!folder || !boardId) {
			return;
		}
		const isOpen = boardsList.isFolderContainsBoard(folder.id, boardId);

		if (isOpen) {
			accordionRef.current?.open(() => {
				setTimeout(() => {
					if (currentBoardRef.current) {
						currentBoardRef.current.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
					}
				}, 0);
			});
		} else {
			setOpenedByDragging(false);
			accordionRef.current?.close();
		}
	};

	const openFoldersContainsFolder = (folderId: number) => {
		if (!folder || !folderId) {
			return;
		}
		const isOpen = boardsList.isFolderContainsFolder(folder.id, folderId);
		if (isOpen && folder.items.length > 0) {
			accordionRef.current?.open(() => {
				setTimeout(() => {
					if (
						currentFolderRef.current &&
						folder.id === openedFoldersFolderId
					) {
						currentFolderRef.current.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
					}
				}, 0);
			});
		} else {
			setOpenedByDragging(false);
			accordionRef.current?.close();
		}
	};

	useEffect(() => {
		if (folder && folder.items && folder.items.length > 0) {
			openFoldersContainsBoard(openedFoldersBoardId);
		}
		if (folder && folder.items && openedFoldersFolderId) {
			openFoldersContainsFolder(openedFoldersFolderId);
		}
	}, [
		folder?.id,
		openedFoldersBoardId,
		openedFoldersFolderId,
		isSidePanelOpen,
	]);

	useEffect(() => {
		if (isOver && !accordionRef.current?.isOpen) {
			setOverFolderId(folder?.id);
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
			setOverFolderId(null);
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
	}, [
		isSidePanelOpen,
		boardsList.getRootFolder(),
		boardsList.getSharedFolder(),
	]);

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

	const handleContextMenuOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		open(ev.clientX, ev.clientY, undefined, folder.id);
	};

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
				style={{ zIndex }}
				ref={accordionRef}
				elemRef={setNodeRef}
				renderHeader={({ toggle, isOpen }) => (
					<DraggingWrapper
						isDragging={isDragging}
						style={{ ...style, ...originalPosition }}
						draggableItem={
							<DraggingItem
								style={{
									width: originalPosition.width,
									height: originalPosition.height,
								}}
								name={folder.title}
								icon={
									<span className={styles.icon}>
										<Icon
											width={20}
											height={20}
											iconName={folderIcons[folder.type]}
										/>
									</span>
								}
							/>
						}
					>
						<div
							className={styles.wrapper}
							{...listeners}
							{...attributes}
							ref={node => {
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
									<Icon
										width={16}
										height={16}
										iconName="ThreeDots"
									/>
								</button>
							)}
							<button
								ref={currentFolderRef}
								className={clsx(
									styles.header,
									isOver && styles.over,
								)}
								onClick={handleClick(toggle)}
								onContextMenu={handleContextMenuOpen}
							>
								<span className={styles.icon}>
									<Icon
										width={20}
										height={20}
										iconName={
											isOpen ? "ArrowUp" : "ArrowDown"
										}
									/>
									<Icon
										width={20}
										height={20}
										iconName={folderIcons[folder.type]}
									/>
								</span>
								{isRenaming ? (
									<RenameInput />
								) : (
									<span>{folder.title}</span>
								)}
							</button>
						</div>
					</DraggingWrapper>
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
												enterActive:
													styles.fadeEnterActive,
												exit: styles.fadeExit,
												exitActive:
													styles.fadeExitActive,
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
													parentFolderId={folder.id}
													zIndex={zIndex + 1}
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
		</SortableContext>
	);
};

Folder.displayName = "Folder";
