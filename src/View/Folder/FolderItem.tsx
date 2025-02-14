import { useSortable } from "@dnd-kit/sortable";
import { useAccount } from "App/useAccount";
import clsx from "clsx";
import { handleClickDetection } from "lib/handleClickDetection";
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type MouseEventHandler,
	type SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { boardsApiV2, foldersApi } from "shared/apiV2";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { Icon } from "View/Icon";
import { RenameInput, useRenameContext } from "View/Rename";
import { DraggingItem } from "./DraggingItem";
import { DraggingWrapper } from "./DraggingWrapper";
import styles from "./FolderItem.module.css";
import { useFoldersContext } from "./FoldersContext";

type Props = {
	board: foldersApi.NestedBoard;
	folder?: foldersApi.Folder | foldersApi.NestedFolder;
	handleOpenBoard?: (board: boardsApiV2.Board) => void;
};

export const FolderItem = forwardRef<HTMLDivElement, Props>(
	({ board, folder, handleOpenBoard }, ref) => {
		const { app, board: currentBoard } = useAppContext();
		const navigate = useNavigate();
		const { open } = useContextMenuContext();
		const { setRenamingId, setNewName, renamingId } = useRenameContext();
		const account = useAccount();
		const itemRef = useRef<HTMLDivElement | null>(null);
		const [originalPosition, setOriginalPosition] = useState<
			Record<"left" | "top" | "width" | "height", number>
		>({ left: 0, top: 0, width: 0, height: 0 });

		const { setOverFolderId } = useFoldersContext();

		const {
			attributes,
			listeners,
			setNodeRef,
			transform,
			isDragging,
			isOver,
		} = useSortable({
			id: board.id,
			data: { ...board, parentFolderId: folder?.id },
		});

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

			return () => {
				document.removeEventListener(
					"scroll",
					calcOriginalPosition,
					true,
				);
			};
		}, [isDragging]);

		useEffect(() => {
			if (isOver) {
				setOverFolderId(folder?.id);
			} else {
				setOverFolderId(null);
			}
		}, [isOver]);

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
				async ev => {
					ev.preventDefault();
					ev.stopPropagation();
					if (handleOpenBoard) {
						return handleOpenBoard(board);
					}
					await app.openBoard(board.id);
					navigate(`/boards/${board.id}`);
					const newBoard = app.getBoard();
					const itemsMbr = newBoard.items.getMbr();
					newBoard.camera.zoomToFit(itemsMbr);
				},
				ev => {
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

		const handleContextMenuOpen: MouseEventHandler = ev => {
			ev.preventDefault();
			ev.stopPropagation();
			open(ev.clientX, ev.clientY, board.id, folder?.id);
		};

		return (
			<DraggingWrapper
				isDragging={isDragging}
				style={{ ...style, ...originalPosition }}
				draggableItem={
					<DraggingItem
						style={{
							width: originalPosition.width,
							height: originalPosition.height,
						}}
						name={board.title}
						icon={
							<span className={styles.icon}>
								<Icon
									width={20}
									height={20}
									iconName={
										board.isPublic
											? "EmbedBoardIcon"
											: "lock"
									}
								/>
							</span>
						}
					/>
				}
			>
				<div
					ref={node => {
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
								[styles.active]: isActive || isDragging,
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
								iconName={
									board.isPublic ? "EmbedBoardIcon" : "lock"
								}
							/>
						</span>
						{isRenaming ? (
							<RenameInput />
						) : (
							<span className={styles.title}>{board.title}</span>
						)}
					</button>
				</div>
				{isOver && <div className={styles.placeholder}></div>}
			</DraggingWrapper>
		);
	},
);

FolderItem.displayName = "FolderItem";
