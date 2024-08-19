import React, {
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

export function ContextMenu() {
	const { isOpen, boardId, x, y, close } = useContextMenuContext();
	const { app, board } = useAppContext();
	const { openModalConfirm } = useConfirmModalContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { setRenamingBoardId, setNewBoardName } = useBoardRenameContext();

	if (!isOpen) {
		return null;
	}
	const boardName =
		app.storage.getBoard(boardId)?.name || t("board.untitled");

	const handleCreateBoard: MouseEventHandler = async () => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
	};

	const handleDeleteBoard: MouseEventHandler = (ev): Promise<void> => {
		ev.preventDefault();
		ev.stopPropagation();
		if (!boardId) {
			throw new Error("Can't delete board with id null");
		}
		const removingCurr = boardId === app.getBoard()?.getBoardId();
		app.storage.removeBoard(boardId).then(() => {
			if (removingCurr) {
				navigate("/boards");
				app.openBoard("blank");
			}
			close();
		});
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

	return (
		<UiPanel
			style={{ left: x, top: y }}
			className={style.menu}
			vertical
			padding={6}
		>
			{boardId ? (
				<>
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
						icon={<Icon iconName="Delete" width={20} height={20} />}
					>
						{t("contextMenu.delete")}
					</ContextMenuItem>
					<ContextMenuItem
						onClick={handleRenameBoard}
						icon={<Icon iconName="Rename" width={20} height={20} />}
					>
						{t("contextMenu.rename")}
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
