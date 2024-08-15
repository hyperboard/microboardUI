import React, {
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiPanel } from "View/Ui/UiPanel";
import style from "./ContextMenu.module.css";
import { useContextMenuContext } from "./ContextMenuContext";

export function ContextMenu() {
	const { isOpen, boardId, x, y, close } = useContextMenuContext();
	const { app, board } = useAppContext();
	const navigate = useNavigate();
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	const handleCreateBoard: MouseEventHandler = async () => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
	};

	const handleDeleteBoard: MouseEventHandler = e => {
		e.preventDefault();
		e.stopPropagation();
		if (!boardId) {
			throw new Error("Can't delete board with id null");
		}
		const removingCurr = boardId === app.getBoard()?.getBoardId();
		app.storage
			.removeBoard(boardId)
			.then(() => {
				// app.storage.showedErrorModals[boardId] = true;
				if (removingCurr) {
					navigate("/boards");
					app.openBoard("blank");
				}
				close();
			})
			.catch(console.error);
	};

	return (
		<UiPanel style={{ left: x, top: y }} className={style.menu} padding={6}>
			{boardId ? (
				<ContextMenuItem
					onClick={handleDeleteBoard}
					icon={<Icon iconName="Delete" width={20} height={20} />}
				>
					{t("contextMenu.delete")}
				</ContextMenuItem>
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
			{icon}
			<span>{children}</span>
		</button>
	);
}
