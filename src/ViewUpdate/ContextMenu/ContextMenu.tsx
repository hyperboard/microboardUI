import React, {
	type MouseEventHandler,
	type PropsWithChildren,
	type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiPanel } from "ViewUpdate/Ui/UiPanel";
import style from "./ContextMenu.module.css";
import { useContextMenuContext } from "./ContextMenuContext";

export function ContextMenu() {
	const { isOpen, boardId, x, y, close } = useContextMenuContext();
	const { app, board } = useAppContext();
	const navigate = useNavigate();

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
		app.storage.removePublicBoard(boardId);
		close();
		if (boardId === board.getBoardId()) {
			navigate("/");
		}
	};

	return (
		<UiPanel style={{ left: x, top: y }} className={style.menu} padding={6}>
			{boardId ? (
				<ContextMenuItem
					onClick={handleDeleteBoard}
					icon={<Icon iconName="Delete" width={20} height={20} />}
				>
					Delete
				</ContextMenuItem>
			) : (
				<ContextMenuItem
					onClick={handleCreateBoard}
					icon={<Icon iconName="Board" width={20} height={20} />}
				>
					New board
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
