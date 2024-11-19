import React, {
	MouseEvent,
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { useBoardRenameContext } from "View/BoardName";
import { Icon } from "View/Icon";
import { UiPanel } from "View/Ui/UiPanel";
import style from "./ContextMenu.module.css";
import { useContextMenuContext } from "./ContextMenuContext";
import { useConfirmModalContext } from "View/Modal/ConfirmModal";
import { useBoardsList } from "App/useBoardsList";
import { useAccount } from "App/useAccount";

export function ContextMenu() {
	const { isOpen, boardId, x, y, close } = useContextMenuContext();
	const { openModalConfirm } = useConfirmModalContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { setRenamingBoardId, setNewBoardName } = useBoardRenameContext();
	const boardsList = useBoardsList();
	const account = useAccount();
	const { app } = useAppContext();

	if (!isOpen) {
		return null;
	}
	const boardName =
		boardsList.getBoardInfo(boardId)?.title || t("board.untitled");

	const handleCreateBoard: MouseEventHandler = async (ev: MouseEvent) => {
		ev.preventDefault();
		ev.stopPropagation();
		const boardId = await boardsList.createBoard();
		await app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
		setNewBoardName(boardName);
		setRenamingBoardId(boardId);
		close();
	};

	const handleDeleteBoard: MouseEventHandler = async (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();
		if (!boardId) {
			throw new Error("Can't delete board with id null");
		}
		const removingCurr = boardId === app.getBoard()?.getBoardId();
		boardsList.remove(boardId);
		if (removingCurr) {
			navigate("/boards");
			await app.openBoard("blank");
		}
		close();
		return Promise.resolve();
	};

	const handleRenameBoard: MouseEventHandler = event => {
		event.preventDefault();
		event.stopPropagation();

		if (!boardId) {
			return;
		}

		setNewBoardName(boardName);
		setRenamingBoardId(boardId);
		close();
	};

	const canRename = account.permissions.checkPermissions(
		"owns",
		"boards",
		boardId ?? "",
	);

	const isSharedBoard = Boolean(
		boardsList.sharedBoards.find(b => b.id === boardId),
	);

	return (
		<UiPanel
			style={{ left: x, top: y }}
			className={style.menu}
			vertical
			padding={6}
			zIndex={100}
		>
			{boardId ? (
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
			)}
		</UiPanel>
	);
}

type ItemProps = PropsWithChildren<{
	icon: ReactNode;
	onClick: MouseEventHandler;
}>;

function ContextMenuItem({ children, icon, onClick }: ItemProps) {
	return (
		<button className={style.item} onClick={onClick}>
			<span className={style.icon}>{icon}</span>
			<span>{children}</span>
		</button>
	);
}
