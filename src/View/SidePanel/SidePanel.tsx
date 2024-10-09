import { useAccount } from "App/useAccount";
import { useBoardsList } from "App/useBoardsList";
import clsx from "clsx";
import { useClickOutside } from "lib/useClickOutside";
import React, {
	ChangeEventHandler,
	useState,
	type MouseEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui-lib/Button";
import { useAppContext } from "View/AppContext";
import { BoardRename, useBoardRenameContext } from "View/BoardName";
import { useContextMenuContext } from "View/ContextMenu";
import { Folders } from "View/Folder";
import { Icon } from "View/Icon";
import { ImportMiroStartModal } from "View/ImportMiro";
import { UiButton } from "View/Ui/UiButton";
import { Tooltip } from "View/Ui/UiButton/Tooltip";
import { UiPanel } from "View/Ui/UiPanel";
import { ResizableEdge } from "./ResizableEdge";
import style from "./SidePanel.module.css";
import { useSidePanelContext } from "./SidePanelContext";

const MIN_PANEL_WIDTH = 280;

export function SidePanel(): JSX.Element {
	const { isOpen, toggleSideMenu, handleAddNew, isHighlighted } =
		useSidePanelContext();
	const { app, board } = useAppContext();
	const { open, close } = useContextMenuContext();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [width, setWidth] = useState(300);
	const boardsList = useBoardsList();
	const account = useAccount();
	const publicBoards = boardsList.publicBoards;
	const sharedBoards = boardsList.sharedBoards;
	const isBlank =
		app.getBoard() === undefined || app.getBoard().getBoardId() === "blank";
	const [isLoading, setIsLoading] = useState(false);

	const isShared = sharedBoards.some(({ id }) => id === board.getBoardId());
	const isPublic = publicBoards.some(({ id }) => id === board.getBoardId());

	const [isOpenImportMiro, setIsOpenImportMiro] = useState(false);
	const {
		setRenamingBoardId,
		setNewBoardName,
		renamingBoardId,
		rename,
		newBoardName,
	} = useBoardRenameContext();

	const panelRef = useClickOutside(() => {
		close();
	});

	const handleBoardClick = async (boardId: string): Promise<void> => {
		await app.openBoard(boardId);
		navigate(`/boards/${boardId}`, { replace: true });
	};

	const handleContextMenuOpen: MouseEventHandler = event => {
		event.preventDefault();
		console.log("open");
		close();
		open(event.clientX, event.clientY);
	};

	const handleContextMenuClose: MouseEventHandler = event => {
		event.preventDefault();
		close();
	};

	const handleBoardRename: ChangeEventHandler<HTMLInputElement> = event => {
		setNewBoardName(event.currentTarget.value);
	};

	const handleBoardRenameStart =
		(boardId: string): MouseEventHandler =>
		event => {
			const canRename = account.permissions.checkPermissions(
				"owns",
				"boards",
				boardId ?? "",
			);
			if (!canRename) {
				return;
			}
			event.preventDefault();
			const boardName =
				boardsList.getBoardInfo(boardId)?.title || t("board.untitled");
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
			className={clsx(style.sidePanel, {
				[style.open]: isOpen,
				[style.highlited]: isHighlighted,
			})}
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
				<Folders
					containerClassName={style.folders}
					isAuth={account.isLoggedIn}
					isPublicOpened={isPublic || isBlank}
					isSharedOpened={isShared || isBlank}
					currBoardId={app.getBoard().getBoardId()}
					publicBoards={publicBoards}
					sharedBoards={sharedBoards}
					activeBoardFunction={board =>
						board.id === app.getBoard().getBoardId()
					}
					boardNameOnClick={board => handleBoardClick(board.id)}
					boardNameOnClickContext={board =>
						handleBoardContextMenu(board.id)
					}
					boardNameOnDoubleClick={board =>
						handleBoardRenameStart(board.id)
					}
					boardNameChildren={board => (
						<>
							{renamingBoardId === board.id ? (
								<BoardRename
									value={newBoardName}
									onCancel={handleRenameCancel}
									onChange={handleBoardRename}
									onConfirm={rename}
								/>
							) : (
								board.title || t("board.untitled")
							)}
						</>
					)}
				/>
			</div>
			<div className={style.bottom}>
				<button
					disabled={isLoading}
					className={style.add}
					onClick={async () => {
						setIsLoading(true);
						if (isLoading) {
							return;
						}
						await handleAddNew(boardId => {
							setNewBoardName(t("board.untitled"));
							setRenamingBoardId(boardId);
						});
						setIsLoading(false);
					}}
				>
					<Icon iconName="Plus" width={16} height={16} />
					<span>{t("sidePanel.addNew")}</span>
				</button>
			</div>
			<div className={style.importMiroBtnWr}>
				<Button
					id={"miro"}
					pattern="primary"
					onClick={() => setIsOpenImportMiro(true)}
					disabled={!account.isLoggedIn}
					className={style.importMiroBtn}
				>
					<Icon
						iconName="miro"
						width={16}
						height={16}
						style={{ color: "#050038" }}
					/>
					<span>{t("miro.importMiroBtn")}</span>
					<Tooltip
						tooltip={
							!account.isLoggedIn
								? t("miro.authTooltip")
								: t("miro.tooltipClipboardImport")
						}
						tooltipPosition="top-center-fixed"
						tooltipAlign="left"
					/>
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
