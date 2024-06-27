import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import { useForceUpdate } from "lib/useForceUpdate";
import React, {
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { Folder } from "View/Folder/Folder";
import { FolderItem } from "View/Folder/FolderItem";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import { UiPanel } from "View/Ui/UiPanel";
import { ResizableEdge } from "./ResizableEdge";
import style from "./SidePanel.module.css";
import { useSidePanelContext } from "./SidePanelContext";

export function SidePanel() {
	const { isOpen, toggleSideMenu } = useSidePanelContext();
	const [width, setWidth] = useState(300);
	const animationId = useRef<number | null>(null);
	const forceUpdate = useForceUpdate();
	const { app, board } = useAppContext();
	const navigate = useNavigate();
	const { open, close } = useContextMenuContext();

	const update = () => {
		if (animationId.current) {
			return; // Function already scheduled to run
		}

		animationId.current = requestAnimationFrame(() => {
			forceUpdate();
			animationId.current = null;
		});
	};

	useEffect(() => {
		app.storage.subject.subscribe(update);

		return () => {
			app.storage.subject.unsubscribe(update);
		};
	}, []);

	const panelRef = useClickOutside(() => {
		close();
	});

	const handleBoardClick = (boardId: string) => {
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, { replace: true });
	};

	const handleContextMenuOpen: MouseEventHandler = e => {
		e.preventDefault();
		open(e.clientX, e.clientY);
	};

	const handleContextMenuClose: MouseEventHandler = e => {
		e.preventDefault();
		close();
	};

	const handleBoardContextMenu =
		(boardId: string): MouseEventHandler =>
		e => {
			e.preventDefault();
			e.stopPropagation();
			open(e.clientX, e.clientY, boardId);
		};

	const handleAddNew: MouseEventHandler = async () => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
	};

	const publicBoards = app.storage.listPublicBoards();
	const isFolderOpen = publicBoards.some(
		({ boardId }) => boardId === board.getBoardId(),
	);
	return (
		<UiPanel
			ref={panelRef}
			onContextMenu={handleContextMenuOpen}
			onClick={handleContextMenuClose}
			padding={0}
			className={clsx(style.sidePanel, { [style.open]: isOpen })}
		>
			<div style={{ width }} className={style.content}>
				<div className={style.header}>
					<h3 className={style.title}>Boards</h3>
					<UiButton
						onClick={toggleSideMenu}
						variant="secondary"
						className={style.close}
					>
						<Icon iconName="Close" />
					</UiButton>
				</div>
				<div className={style.folders}>
					<Folder
						title="Public boards"
						icon={<Icon iconName="Folder" width={20} height={20} />}
						isOpened={isFolderOpen}
					>
						{publicBoards.map(({ boardId }) => (
							<FolderItem
								active={boardId === board.getBoardId()}
								key={boardId}
								onClick={() => handleBoardClick(boardId)}
								onClickContext={handleBoardContextMenu(boardId)}
								text={boardId}
							/>
						))}
					</Folder>
				</div>
			</div>
			<div className={style.bottom}>
				<button className={style.add} onClick={handleAddNew}>
					<Icon iconName="Plus" width={16} height={16} />
					<span>Add new</span>
				</button>
			</div>
			<ResizableEdge panelWidth={width} setWidth={setWidth} />
		</UiPanel>
	);
}
