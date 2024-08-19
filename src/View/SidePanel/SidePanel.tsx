import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import { useForceUpdate } from "lib/useForceUpdate";
import React, {
	ChangeEventHandler,
	useEffect,
	useRef,
	useState,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
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
import { BoardName, BoardRename, useBoardRenameContext } from "View/BoardName";
import { ImportMiroStartModal } from "View/ImportMiro";
import { Button } from "shared/ui-lib/Button";
import { Tooltip } from "View/Ui/UiButton/Tooltip";

const MIN_PANEL_WIDTH = 250;

export function SidePanel(): React.ReactNode {
	const { isOpen, toggleSideMenu } = useSidePanelContext();
	const { app, board } = useAppContext();
	const { open, close } = useContextMenuContext();
	const { t } = useTranslation();
	const animationId = useRef<number | null>(null);
	const forceUpdate = useForceUpdate();
	const navigate = useNavigate();
	const [width, setWidth] = useState(300);
	const publicBoards = app.storage.listPublicBoards();
	const sharedBoards = app.storage.listSharedBoards();
	const isBlank =
		app.getBoard() === undefined || app.getBoard().getBoardId() === "blank";
	const isShared = sharedBoards.some(
		({ boardId }) => boardId === board.getBoardId(),
	);
	const isPublic = publicBoards.some(
		({ boardId }) => boardId === board.getBoardId(),
	);

	const [isOpenImportMiro, setIsOpenImportMiro] = useState(false);
	const {
		setRenamingBoardId,
		setNewBoardName,
		renamingBoardId,
		rename,
		newBoardName,
	} = useBoardRenameContext();

	const update = (): void => {
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

	const handleBoardClick = (boardId: string): void => {
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, { replace: true });
	};

	const handleContextMenuOpen: MouseEventHandler = event => {
		event.preventDefault();
		open(event.clientX, event.clientY);
	};

	const handleContextMenuClose: MouseEventHandler = event => {
		event.preventDefault();
		close();
	};

	const handleBoardRename: ChangeEventHandler<HTMLInputElement> = event => {
		setNewBoardName(event.currentTarget.value);
	};

	const handleAddNew = async (): Promise<void> => {
		const boardId = await app.createPublicBoard();
		app.openBoard(boardId);
		navigate(`/boards/${boardId}`, {
			replace: true,
		});
		setNewBoardName(t("board.untitled"));
		setRenamingBoardId(boardId);
	};

	const handleBoardRenameStart =
		(boardId: string): MouseEventHandler =>
		event => {
			event.preventDefault();
			const boardName =
				app.storage.getBoard(boardId)?.name || t("board.untitled");
			console.log(boardId, app.storage.getBoard(boardId));
			setRenamingBoardId(boardId);
			setNewBoardName(boardName);
		};

	const handleRenameCancel = () => {
		setRenamingBoardId(null);
		setNewBoardName("");
	};

	const handleBoardContextMenu =
		(boardId: string): MouseEventHandler =>
		e => {
			e.preventDefault();
			e.stopPropagation();
			open(e.clientX, e.clientY, boardId);
		};

	const newWidth = width <= MIN_PANEL_WIDTH ? MIN_PANEL_WIDTH : width;
	return (
		<UiPanel
			ref={panelRef}
			onContextMenu={handleContextMenuOpen}
			onClick={handleContextMenuClose}
			padding={0}
			className={clsx(style.sidePanel, { [style.open]: isOpen })}
			style={{ width: newWidth }}
		>
			<div className={style.content}>
				<div className={style.header}>
					<h3 className={style.title}>{t("sidePanel.title")}</h3>
					<UiButton
						onClick={toggleSideMenu}
						variant="secondary"
						className={style.close}
					>
						<Icon iconName="Close" />
					</UiButton>
				</div>
				<div className={style.folders}>
					{app.storage.isAuth && (
						<Folder
							title={t("sidePanel.folders.myBoards")}
							icon={
								<Icon
									iconName="myBoards"
									width={20}
									height={20}
								/>
							}
							isOpened={isPublic || isBlank}
						>
							<Folder
								title={t("sidePanel.folders.publicDrafts")}
								icon={
									<Icon
										iconName="publicDrafts"
										width={20}
										height={20}
									/>
								}
								isOpened={isPublic || isBlank}
							>
								{publicBoards.map(({ boardId, name }) => (
									<FolderItem key={boardId}>
										<BoardName
											active={
												board.getBoardId() === boardId
											}
											onClick={() =>
												handleBoardClick(boardId)
											}
											onClickContext={handleBoardContextMenu(
												boardId,
											)}
											onDoubleClick={handleBoardRenameStart(
												boardId,
											)}
										>
											{renamingBoardId === boardId ? (
												<BoardRename
													value={newBoardName}
													onCancel={
														handleRenameCancel
													}
													onChange={handleBoardRename}
													onConfirm={rename}
												/>
											) : (
												name || t("board.untitled")
											)}
										</BoardName>
									</FolderItem>
								))}
							</Folder>
						</Folder>
					)}
					{!app.storage.isAuth && (
						<Folder
							title={t("sidePanel.folders.publicDrafts")}
							icon={
								<Icon
									iconName="publicDrafts"
									width={20}
									height={20}
								/>
							}
							isOpened={isPublic || isBlank}
						>
							{publicBoards.map(({ boardId, name }) => (
								<FolderItem key={boardId}>
									<BoardName
										active={board.getBoardId() === boardId}
										onClick={() =>
											handleBoardClick(boardId)
										}
										onClickContext={handleBoardContextMenu(
											boardId,
										)}
										onDoubleClick={handleBoardRenameStart(
											boardId,
										)}
									>
										{renamingBoardId === boardId ? (
											<BoardRename
												value={newBoardName}
												onCancel={handleRenameCancel}
												onChange={handleBoardRename}
												onConfirm={rename}
											/>
										) : (
											name || t("board.untitled")
										)}
									</BoardName>
								</FolderItem>
							))}
						</Folder>
					)}
					<Folder
						title={t("sidePanel.folders.sharedBoards")}
						icon={
							<Icon
								iconName="sharedBoards"
								width={20}
								height={20}
							/>
						}
						isOpened={isShared || isBlank}
					>
						{sharedBoards.map(({ boardId, name }) => (
							<FolderItem key={boardId}>
								<BoardName
									active={board.getBoardId() === boardId}
									onClick={() => handleBoardClick(boardId)}
									onClickContext={handleBoardContextMenu(
										boardId,
									)}
									onDoubleClick={handleBoardRenameStart(
										boardId,
									)}
								>
									{renamingBoardId === boardId ? (
										<BoardRename
											value={newBoardName}
											onCancel={handleRenameCancel}
											onChange={handleBoardRename}
											onConfirm={rename}
										/>
									) : (
										name || t("board.untitled")
									)}
								</BoardName>
							</FolderItem>
						))}
					</Folder>
				</div>
			</div>
			<div className={style.bottom}>
				<button className={style.add} onClick={handleAddNew}>
					<Icon iconName="Plus" width={16} height={16} />
					<span>{t("sidePanel.addNew")}</span>
				</button>
			</div>
			<div className={style.importMiroBtnWr}>
				<Button
					id={"miro"}
					pattern="secondary"
					onClick={() => setIsOpenImportMiro(true)}
					disabled={!app.storage.isAuth}
					className={style.importMiroBtn}
				>
					<Icon
						iconName="import"
						width={16}
						height={16}
						style={{ fill: "#696B76" }}
					/>
					<span>{t("miro.importMiroBtn")}</span>
					{!app.storage.isAuth && (
						<Tooltip
							tooltip={t("miro.importMiroBtnTooltip")}
							tooltipPosition="top-center-fixed"
						/>
					)}
				</Button>
			</div>
			<ResizableEdge panelWidth={width} setWidth={setWidth} />
			<ImportMiroStartModal
				isOpen={isOpenImportMiro}
				setIsOpen={setIsOpenImportMiro}
			/>
		</UiPanel>
	);
}
