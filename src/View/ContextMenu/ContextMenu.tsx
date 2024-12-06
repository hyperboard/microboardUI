import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { useClickOutside } from "lib/useClickOutside";
import React, {
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { UiPanel } from "View/Ui/UiPanel";
import style from "./ContextMenu.module.css";
import { useContextMenuContext } from "./ContextMenuContext";
import { useRenameContext } from "View/Rename";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { UiSeparator } from "View/Ui/UiSeparator";
import { foldersApi } from "shared/apiV2";
import { useUiModalContext } from "View/Ui/UiModal";
import { SHARE_MODAL_ID } from "View/ShareModal/ShareModal";
import { useAppContext } from "View/AppContext";
import { useNavigate } from "react-router-dom";

export function ContextMenu() {
	const { boardId, x, y, isOpen, folderId, close } = useContextMenuContext();
	const { setNewName, setRenamingId } = useRenameContext();
	const boardsList = useBoardsList();
	const account = useAccount();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const { openModalConfirm } = useConfirmModalContext();
	const { openModal } = useUiModalContext();
	const menuRef = useClickOutside(() => {
		close();
	});
	const navigate = useNavigate();
	const currentBoardId = board.getBoardId();

	const boardInfo = boardsList.getBoardInfo(boardId);
	const folderInfo = boardsList.getFolder(folderId);

	const hasOwnerRights = boardId
		? account.permissions.checkPermissions("owns", "boards", boardId)
		: false;
	const isFolderEditable = folderInfo
		? folderInfo.type === foldersApi.FolderType.NESTED
		: false;
	const isFolderExtendable = folderInfo
		? folderInfo.type !== foldersApi.FolderType.TRASH &&
			folderInfo.type !== foldersApi.FolderType.DRAFTS &&
			folderInfo.type !== foldersApi.FolderType.VISITED
		: false;

	const isBoardMenu = boardId && folderId;
	const isFolderMenu = !boardId && folderId && isFolderEditable;

	const handleCreateBoard: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();
		console.log("parent folder", folderId);
		const boardId = await boardsList.createBoard(
			undefined,
			undefined,
			folderId ?? undefined,
		);
		close();
		const boardInfo = boardsList.getBoardInfo(boardId);
		setRenamingId(boardId);
		setNewName(boardInfo?.title ?? "");
	};

	const handleCreateFolder: MouseEventHandler = async ev => {
		if (!account.isLoggedIn) {
			return;
		}
		ev.preventDefault();
		ev.stopPropagation();
		await boardsList.createFolder(undefined, folderId ?? undefined);
		close();
	};

	const handleRename: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		if (isFolderMenu && folderInfo) {
			setRenamingId(folderId);
			setNewName(folderInfo?.title);
		}

		if (boardId && boardInfo) {
			setRenamingId(boardId);
			setNewName(boardInfo?.title);
		}
		close();
	};

	const handleDeleteBoard: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		openModalConfirm(
			"Deleting document",
			`Are you sure you want to delete the board "${boardInfo?.title}"`,
			async () => {
				if (!boardId || !folderId) {
					return;
				}

				if (boardId === currentBoardId) {
					navigate("/boards/blank");
				}

				if (hasOwnerRights) {
					boardsList.removeBoard(boardId);
				} else {
					boardsList.removeBoardFromFolder(folderId, boardId);
				}
				close();
				Promise.resolve();
			},
		);
	};

	const handleDeleteFolder: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		openModalConfirm(
			"Deleting document",
			`Are you sure you want to delete the folder "${folderInfo?.title}"`,
			async () => {
				if (!folderId) {
					return;
				}

				boardsList.removeFolder(folderId);
				close();
				Promise.resolve();
			},
		);
	};

	const handleSharingModalOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();

		if (!boardId) {
			return;
		}

		openModal(SHARE_MODAL_ID);
		close();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<UiPanel
			style={{ left: x, top: y }}
			className={style.menu}
			vertical
			padding={6}
			zIndex={100}
			ref={menuRef}
		>
			{!boardId && !folderId && (
				<>
					<ContextMenuItem
						onClick={handleCreateBoard}
						icon={
							<Icon
								iconName="EmbedBoardIcon"
								width={20}
								height={20}
							/>
						}
					>
						New board
					</ContextMenuItem>
					<ContextMenuItem
						disabled={!account.isLoggedIn}
						onClick={handleCreateFolder}
						icon={<Icon iconName="Folder" width={20} height={20} />}
					>
						New folder
					</ContextMenuItem>
				</>
			)}
			{isFolderExtendable && (
				<>
					<ContextMenuItem
						onClick={handleCreateBoard}
						icon={
							<Icon
								iconName="EmbedBoardIcon"
								width={20}
								height={20}
							/>
						}
					>
						New board
					</ContextMenuItem>
					<ContextMenuItem
						disabled={!account.isLoggedIn}
						onClick={handleCreateFolder}
						icon={<Icon iconName="Folder" width={20} height={20} />}
					>
						New folder
					</ContextMenuItem>
				</>
			)}
			{isBoardMenu && (
				<>
					<UiSeparator />
					<ContextMenuItem
						onClick={handleSharingModalOpen}
						icon={<Icon iconName="People" />}
					>
						Manage sharing
					</ContextMenuItem>
					<UiSeparator />
					{hasOwnerRights && (
						<ContextMenuItem
							onClick={handleRename}
							icon={
								<Icon
									iconName="Rename"
									width={20}
									height={20}
								/>
							}
						>
							Rename
						</ContextMenuItem>
					)}
					<ContextMenuItem
						onClick={handleDeleteBoard}
						icon={<Icon iconName="Delete" width={20} height={20} />}
					>
						{hasOwnerRights ? "Delete" : "Remove from my list"}
					</ContextMenuItem>
				</>
			)}
			{isFolderMenu && (
				<>
					<UiSeparator />
					<ContextMenuItem
						onClick={handleRename}
						icon={<Icon iconName="Rename" width={20} height={20} />}
					>
						Rename
					</ContextMenuItem>
					<ContextMenuItem
						onClick={handleDeleteFolder}
						icon={<Icon iconName="Delete" width={20} height={20} />}
					>
						Delete
					</ContextMenuItem>
				</>
			)}
			{/* {boardId ? (
				<>
					{canRename && (
						<ContextMenuItem
							onClick={handleRenameBoard}
							icon={
								<Icon
									iconName="Rename"
									width={20}
									height={20}
								/>
							}
						>
							{t("contextMenu.rename")}
						</ContextMenuItem>
					)}
					<ContextMenuItem
						onClick={event => {
							event.preventDefault();
							event.stopPropagation();
							close();
							openModalConfirm(
								t("modalConfirm.deleteBoard.title"),
								`${t(
									"modalConfirm.deleteBoard.description",
								)} "${boardName}"?`,
								() => handleDeleteBoard(event),
							);
						}}
						icon={
							isSharedBoard ? (
								<Icon iconName="Close" width={20} height={20} />
							) : (
								<Icon
									iconName="Delete"
									width={20}
									height={20}
								/>
							)
						}
					>
						{isSharedBoard
							? t("contextMenu.deleteShared")
							: t("contextMenu.delete")}
					</ContextMenuItem>
				</>
			) : (
				<ContextMenuItem
					onClick={handleCreateBoard}
					icon={<Icon iconName="Board" width={20} height={20} />}
				>
					{t("contextMenu.addNew")}
				</ContextMenuItem>
			)} */}
		</UiPanel>
	);
}

type ItemProps = PropsWithChildren<{
	icon: ReactNode;
	onClick: MouseEventHandler;
	disabled?: boolean;
}>;

function ContextMenuItem({
	children,
	icon,
	onClick,
	disabled = false,
}: ItemProps) {
	return (
		<button disabled={disabled} className={style.item} onClick={onClick}>
			<span className={style.icon}>{icon}</span>
			<span>{children}</span>
		</button>
	);
}
