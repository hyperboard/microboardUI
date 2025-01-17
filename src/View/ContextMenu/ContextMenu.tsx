import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { useClickOutside } from "lib/useClickOutside";
import React, {
	useState,
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
import { useOpenedFoldersContext } from "View/Folder";
import { UiLoader } from "View/Ui/UiLoader";
import { Mbr } from "Board/Items";

export function ContextMenu(): JSX.Element | null {
	const { boardId, x, y, isOpen, folderId, close } = useContextMenuContext();
	const { setNewName, setRenamingId } = useRenameContext();
	const boardsList = useBoardsList();
	const account = useAccount();
	const { board, app } = useAppContext();
	const { t } = useTranslation();
	const { openModalConfirm } = useConfirmModalContext();
	const { openModal } = useUiModalContext();
	const menuRef = useClickOutside(() => {
		close();
	});
	const [isFolderCreating, setIsFolderCreating] = useState(false);
	const [isBoardCreating, setIsBoardCreating] = useState(false);
	const [isBoardDeleting, setIsBoardDeleting] = useState(false);
	const [isFolderDeleting, setIsFolderDeleting] = useState(false);

	const { setBoard, setFolder } = useOpenedFoldersContext();
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
			folderInfo.type !== foldersApi.FolderType.VISITED
		: false;

	const isBoardMenu = boardId && folderId;
	const isFolderMenu = !boardId && folderId;

	const handleCreateBoard: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsBoardCreating(true);
		const boardId = await boardsList.createBoard(
			undefined,
			folderInfo?.type === foldersApi.FolderType.DRAFTS,
			folderId ?? undefined,
		);
		setIsBoardCreating(false);
		close();
		const boardInfo = boardsList.getBoardInfo(boardId);
		setRenamingId(boardId);
		setNewName(boardInfo?.title ?? "");
		setBoard(boardId);
		setFolder(null);
	};

	const deserializeBoard = (stringedHTML: string): void => {
		app.getBoard().deserializeHTML(stringedHTML);
		app.render();
		const sumMbr = [
			...app.getBoard().items.listAll(),
			...app.getBoard().items.listFrames(),
		].reduce((acc: undefined | Mbr, item) => {
			if (!acc) {
				return item.getMbr();
			}
			return acc.combine(item.getMbr());
		}, undefined);
		if (sumMbr) {
			app.getBoard().camera.zoomToFit(sumMbr);
		}
	};

	const handleEditLocalFile: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsBoardCreating(true);

		const stringedHTML = await app.openAndEditFile();
		if (stringedHTML) {
			close();
			setBoard(boardId);
			setFolder(null);
			app.openBoardFromFile();
			navigate(`/boards/local`);
			deserializeBoard(stringedHTML);
		}

		setIsBoardCreating(false);
	};

	const handleImportBoard: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsBoardCreating(true);

		const uploadPromise = new Promise<string | undefined>(
			(resolve, reject) => {
				const input = document.createElement("input");
				input.type = "file";
				input.accept = ".html";

				input.onchange = async (event: Event) => {
					const file = (event.target as HTMLInputElement).files?.[0];
					if (file) {
						const reader = new FileReader();
						reader.onload = ev => {
							const htmlContent = ev.target?.result as string;
							resolve(htmlContent);
						};
						reader.onerror = () => {
							reject(new Error("Failed to read file"));
						};
						reader.readAsText(file);
					} else {
						resolve(undefined);
					}
				};

				function resolver(): void {
					resolve(undefined);
				}
				input.onerror = resolver;
				input.oncancel = resolver;
				input.onabort = resolver;

				input.click();
			},
		);
		const stringedHTML = await uploadPromise;
		if (stringedHTML) {
			const boardId = await boardsList.createBoard(
				undefined,
				folderInfo?.type === foldersApi.FolderType.DRAFTS,
				folderId ?? undefined,
			);
			close();
			setBoard(boardId);
			setFolder(null);
			await app.openBoard(boardId);
			navigate(`/boards/${boardId}`);
			deserializeBoard(stringedHTML);
		}

		setIsBoardCreating(false);
	};

	const handleCreateFolder: MouseEventHandler = async ev => {
		if (!account.isLoggedIn) {
			return;
		}
		setIsFolderCreating(true);
		ev.preventDefault();
		ev.stopPropagation();
		const createdFolderId = await boardsList.createFolder(
			undefined,
			folderId ?? undefined,
		);
		setIsFolderCreating(false);
		close();
		setBoard(null);
		setFolder(createdFolderId ?? null);
		setRenamingId(createdFolderId ?? null);
		setNewName(t("board.untitled"));
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
			t("modalConfirm.deleteBoard.title"),
			t("modalConfirm.deleteBoard.description", {
				name: boardInfo?.title,
			}),
			async () => {
				close();
				if (!boardId || !folderId) {
					return;
				}

				if (boardId === currentBoardId) {
					navigate("/boards/blank");
					await app.openBoard("blank");
					board.disconnect();
				}
				setIsBoardDeleting(true);

				if (hasOwnerRights) {
					await boardsList.removeBoard(boardId);
				} else {
					await boardsList.removeItemFromFolder(folderId, boardId);
				}
				Promise.resolve();
				setIsBoardDeleting(false);
			},
			async () => {
				setIsBoardDeleting(false);
				close();
			},
		);
	};

	const handleDeleteFolder: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsFolderDeleting(true);
		openModalConfirm(
			t("modalConfirm.deleteFolder.title"),
			t("modalConfirm.deleteFolder.description", {
				name: folderInfo?.title,
			}),
			async () => {
				close();
				if (!folderId) {
					return;
				}

				boardsList.removeFolder(folderId);
				setIsFolderDeleting(false);
				Promise.resolve();
			},
			async () => {
				setIsFolderDeleting(false);
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

	const isMutationsDisabled =
		isFolderCreating ||
		isBoardCreating ||
		isBoardDeleting ||
		isFolderDeleting;

	if (!isOpen) {
		return null;
	}

	if (isFolderMenu && !isFolderExtendable && !isFolderEditable) {
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
			gap={4}
		>
			{!boardId && !folderId && (
				<>
					<ContextMenuItem
						onClick={handleCreateBoard}
						isLoading={isBoardCreating}
						disabled={isMutationsDisabled}
						icon={
							<Icon
								iconName="EmbedBoardIcon"
								width={20}
								height={20}
							/>
						}
					>
						{t("contextMenu.newBoard")}
					</ContextMenuItem>
					<ContextMenuItem
						disabled={isMutationsDisabled}
						onClick={handleImportBoard}
						icon={
							<Icon
								iconName="UploadBoardIcon"
								width={20}
								height={20}
							/>
						}
						isLoading={isBoardCreating}
					>
						{t("contextMenu.importHTML")}
					</ContextMenuItem>
					<ContextMenuItem
						disabled={isMutationsDisabled}
						onClick={handleEditLocalFile}
						icon={
							<Icon
								iconName="EditBoardIcon"
								width={20}
								height={20}
							/>
						}
						isLoading={isBoardCreating}
					>
						{t("contextMenu.editHTML")}
					</ContextMenuItem>
					<ContextMenuItem
						disabled={!account.isLoggedIn || isMutationsDisabled}
						onClick={handleCreateFolder}
						icon={<Icon iconName="Folder" width={20} height={20} />}
						isLoading={isFolderCreating}
					>
						{t("contextMenu.newFolder")}
					</ContextMenuItem>
				</>
			)}
			{isFolderExtendable && !isBoardMenu && (
				<>
					<ContextMenuItem
						onClick={handleCreateBoard}
						isLoading={isBoardCreating}
						disabled={isMutationsDisabled}
						icon={
							<Icon
								iconName="EmbedBoardIcon"
								width={20}
								height={20}
							/>
						}
					>
						{t("contextMenu.newBoard")}
					</ContextMenuItem>
					<ContextMenuItem
						disabled={!account.isLoggedIn || isMutationsDisabled}
						isLoading={isFolderCreating}
						onClick={handleCreateFolder}
						icon={<Icon iconName="Folder" width={20} height={20} />}
					>
						{t("contextMenu.newFolder")}
					</ContextMenuItem>
				</>
			)}
			{isFolderExtendable && !isBoardMenu && hasOwnerRights && (
				<UiSeparator />
			)}
			{isBoardMenu && (
				<>
					{hasOwnerRights && (
						<>
							<ContextMenuItem
								onClick={handleSharingModalOpen}
								icon={<Icon iconName="People" />}
							>
								{t("contextMenu.manageSharing")}
							</ContextMenuItem>
							<UiSeparator />
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
								{t("contextMenu.rename")}
							</ContextMenuItem>
						</>
					)}
					<ContextMenuItem
						onClick={handleDeleteBoard}
						disabled={isMutationsDisabled}
						icon={<Icon iconName="Delete" width={20} height={20} />}
					>
						{hasOwnerRights
							? t("contextMenu.delete")
							: t("contextMenu.deleteShared")}
					</ContextMenuItem>
				</>
			)}
			{isFolderMenu && (
				<>
					{isFolderEditable && (
						<>
							<UiSeparator />
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
								{t("contextMenu.rename")}
							</ContextMenuItem>
							<ContextMenuItem
								onClick={handleDeleteFolder}
								disabled={isMutationsDisabled}
								icon={
									<Icon
										iconName="Delete"
										width={20}
										height={20}
									/>
								}
							>
								{t("contextMenu.delete")}
							</ContextMenuItem>
						</>
					)}
				</>
			)}
		</UiPanel>
	);
}

type ItemProps = PropsWithChildren<{
	icon: ReactNode;
	onClick: MouseEventHandler;
	disabled?: boolean;
	isLoading?: boolean;
}>;

function ContextMenuItem({
	children,
	icon,
	onClick,
	disabled = false,
	isLoading = false,
}: ItemProps): JSX.Element {
	return (
		<button
			disabled={disabled || isLoading}
			className={style.item}
			onClick={onClick}
		>
			<span className={style.icon}>{icon}</span>
			<span>{children}</span>
			{isLoading && <UiLoader size={20} strokeWidth={3} rotateTime={1} />}
		</button>
	);
}
