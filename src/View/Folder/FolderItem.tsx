import clsx from "clsx";
import { handleClickDetection } from "lib/handleClickDetection";
import React, { type MouseEventHandler } from "react";
import { useNavigate } from "react-router-dom";
import type { boardsApiV2, foldersApi } from "shared/apiV2";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { Icon } from "View/Icon";
import { RenameInput, useRenameContext } from "View/Rename";
import styles from "./FolderItem.module.css";
import { useAccount } from "App/useAccount";

type Props = {
	board: foldersApi.NestedBoard;
	folder?: foldersApi.Folder | foldersApi.NestedFolder;
	handleOpenBoard?: (board: boardsApiV2.Board) => void;
};

export function FolderItem({
	board,
	folder,
	handleOpenBoard,
}: Props): React.ReactElement {
	const { app, board: currentBoard } = useAppContext();
	const navigate = useNavigate();
	const { open } = useContextMenuContext();
	const { setRenamingId, setNewName, renamingId } = useRenameContext();
	const account = useAccount();

	const currentBoardId = currentBoard?.getBoardId();
	const isActive = currentBoardId === board.id;
	const isRenaming = board.id === renamingId;
	const hasOwnerRights = account.permissions.checkPermissions(
		"owns",
		"boards",
		board.id,
	);

	const handleClick = handleClickDetection(
		async ev => {
			ev.preventDefault();
			ev.stopPropagation();
			if (handleOpenBoard) {
				return handleOpenBoard(board);
			}
			await app.openBoard(board.id);
			navigate(`/boards/${board.id}`);
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
	);

	const handleContextMenuOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		open(ev.clientX, ev.clientY, board.id, folder?.id);
	};

	return (
		<div className={styles.wrapper}>
			<button
				className={styles.contextMenuBtn}
				onClick={handleContextMenuOpen}
			>
				<Icon width={16} height={16} iconName="ThreeDots" />
			</button>
			<button
				className={clsx(styles.item, {
					[styles.active]: isActive,
				})}
				onClick={handleClick}
				onContextMenu={handleContextMenuOpen}
			>
				<span className={styles.icon}>
					<Icon
						width={20}
						height={20}
						iconName={board.isPublic ? "EmbedBoardIcon" : "lock"}
					/>
				</span>
				{isRenaming ? <RenameInput /> : <span>{board.title}</span>}
			</button>
		</div>
	);
}
