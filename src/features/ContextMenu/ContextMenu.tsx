import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import { useClickOutside } from "shared/lib/useClickOutside";
import React, {
	useState,
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiPanel } from "shared/ui-lib/UiPanel";
import style from "./ContextMenu.module.css";
import { useContextMenuContext } from "./ContextMenuContext";
import { useRenameContext } from "features/Rename";
import { useConfirmModalContext } from "features/Modal/ConfirmModal";
import { foldersApi } from "shared/apiV2";
import { SHARE_MODAL_ID } from "features/ShareModal/ShareModal";
import { useAppContext } from "features/AppContext";
import { useNavigate } from "react-router-dom";
import { useOpenedFoldersContext } from "entities/Folder";
import { UiLoader } from "shared/ui-lib/UiLoader";
import { Mbr } from "microboard-temp";
import { UiSeparator } from "shared/ui-lib/UiSeparator";
import { useUiModalContext } from "shared/ui-lib/UiModal";

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
	const [isCreatingBoard, setIsCreatingBoard] = useState(false);
	const [isImportingBoard, setIsImportingBoard] = useState(false);
	const [isEditingLocalFile, setIsEditingLocalFile] = useState(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [isDeletingBoard, setIsDeletingBoard] = useState(false);
	const [isDeletingFolder, setIsDeletingFolder] = useState(false);

	const { setId } = useOpenedFoldersContext();
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
		setIsCreatingBoard(true);
		const boardId = await boardsList.createBoard(
			undefined,
			folderInfo?.type === foldersApi.FolderType.DRAFTS,
			folderId ?? undefined,
		);
		setIsCreatingBoard(false);
		close();
		const boardInfo = boardsList.getBoardInfo(boardId);
		setRenamingId(boardId);
		setNewName(boardInfo?.title ?? "");
		setId(boardId);

		app.openBoard(boardId).then(() => navigate(`/boards/${boardId}`));
	};

	const deserializeBoard = (stringedHTML: string, emit = false): void => {
		if (emit) {
			app.getBoard().deserializeHTMLAndEmit(stringedHTML);
		} else {
			app.getBoard().deserializeHTML(stringedHTML);
		}
		app.render();
		const sumMbr = app
			.getBoard()
			.items.listAll()
			.reduce((acc: undefined | Mbr, item) => {
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
		setIsEditingLocalFile(true);

		const stringedHTML = await app.openAndEditFile();
		if (stringedHTML) {
			close();
			setId(boardId);
			app.openBoardFromFile();
			navigate(`/boards/local`);
			deserializeBoard(stringedHTML);
		}

		setIsEditingLocalFile(false);
	};

	const handleImportHTMLBoard: MouseEventHandler = async ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsImportingBoard(true);

		const uploadPromise = new Promise<
			{ htmlContent: string; boardName: string } | undefined
		>((resolve, reject) => {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".html";

			input.onchange = async (event: Event) => {
				const file = (event.target as HTMLInputElement).files?.[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = ev => {
						const htmlContent = ev.target?.result as string;
						const boardName = file.name.replace(/\.html$/i, "");
						resolve({ htmlContent, boardName });
					};
					reader.onerror = () => {
						reject(new Error("Failed to read file"));
					};
					reader.readAsText(file);
				} else {
					resolve(undefined);
				}
			};

			const resolver = (): void => {
				resolve(undefined);
			};
			input.onerror = resolver;
			input.oncancel = resolver;
			input.onabort = resolver;

			input.click();
		});

		const uploadResult = await uploadPromise;
		if (uploadResult) {
			const { htmlContent, boardName } = uploadResult;
			const boardId = await boardsList.createBoard(
				boardName,
				folderInfo?.type === foldersApi.FolderType.DRAFTS,
				folderId ?? undefined,
			);
			close();
			setId(boardId);
			await app.openBoard(boardId);
			navigate(`/boards/${boardId}`);
			deserializeBoard(htmlContent, true);
		}

		setIsImportingBoard(false);
	};

	const handleCreateFolder: MouseEventHandler = async ev => {
		if (!account.isLoggedIn) {
			return;
		}
		setIsCreatingFolder(true);
		ev.preventDefault();
		ev.stopPropagation();
		const createdFolderId = await boardsList.createFolder(
			undefined,
			folderId ?? undefined,
		);
		setIsCreatingFolder(false);
		close();
		setId(createdFolderId ?? null);
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
				setIsDeletingBoard(true);

				if (hasOwnerRights) {
					await boardsList.removeBoard(boardId);
				} else {
					await boardsList.removeItemFromFolder(folderId, boardId);
				}
				Promise.resolve();
				setIsDeletingBoard(false);
			},
			async () => {
				setIsDeletingBoard(false);
				close();
			},
		);
	};

	const handleDeleteFolder: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIsDeletingFolder(true);
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

				if (
					boardsList.isFolderContainsBoard(
						folderId,
						board.getBoardId(),
					)
				) {
					app.openBoard("blank");
					navigate("/boards/blank");
				}

				boardsList.removeFolder(folderId);
				setIsDeletingFolder(false);
				Promise.resolve();
			},
			async () => {
				setIsDeletingFolder(false);
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
		isCreatingBoard ||
		isImportingBoard ||
		isEditingLocalFile ||
		isCreatingFolder ||
		isDeletingBoard ||
		isDeletingFolder;

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
						isLoading={isCreatingBoard}
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
						onClick={handleImportHTMLBoard}
						icon={
							<Icon
								iconName="UploadBoardIcon"
								width={20}
								height={20}
							/>
						}
						isLoading={isImportingBoard}
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
						isLoading={isEditingLocalFile}
					>
						{t("contextMenu.editHTML")}
					</ContextMenuItem>
					<ContextMenuItem
						disabled={!account.isLoggedIn || isMutationsDisabled}
						onClick={handleCreateFolder}
						icon={<Icon iconName="Folder" width={20} height={20} />}
						isLoading={isCreatingFolder}
					>
						{t("contextMenu.newFolder")}
					</ContextMenuItem>
				</>
			)}
			{isFolderExtendable && !isBoardMenu && (
				<>
					<ContextMenuItem
						onClick={handleCreateBoard}
						isLoading={isCreatingBoard}
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
						isLoading={isCreatingFolder}
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
