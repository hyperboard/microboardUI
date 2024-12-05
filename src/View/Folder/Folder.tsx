import React, { type MouseEventHandler } from "react";
import { foldersApi, type boardsApiV2 } from "shared/apiV2";
import { Icon } from "View/Icon";
import type { IconId } from "View/Icon/Icon";
import { UiAdaptiveAccordion } from "View/Ui/UiAdaptiveAccordion";
import styles from "./Folder.module.css";
import { FolderItem } from "./FolderItem";
import { useHoverState } from "lib/useHoverState";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { handleClickDetection } from "lib/handleClickDetection";
import { RenameInput, useRenameContext } from "View/Rename";
import { useContextMenuContext } from "View/ContextMenu";

type Props = {
	folder: foldersApi.Folder | null;
	handleOpenBoard?: (board: boardsApiV2.Board) => void;
};

// @ts-expect-error TODO add icons for all folder types
const folderIcons: Record<foldersApi.FolderType, IconId> = {
	[foldersApi.FolderType.DRAFTS]: "publicDrafts",
	[foldersApi.FolderType.ROOT]: "myBoards",
	[foldersApi.FolderType.VISITED]: "sharedBoards",
	[foldersApi.FolderType.NESTED]: "Folder",
};

export function Folder({ folder, handleOpenBoard }: Props) {
	const { handlePointerEnter, handlePointerLeave, isHover } = useHoverState();
	const { open } = useContextMenuContext();
	const { setNewName, setRenamingId, renamingId } = useRenameContext();

	if (!folder || folder.type === foldersApi.FolderType.TRASH) {
		return null;
	}

	const isRenameAllowed = folder.type === foldersApi.FolderType.NESTED;
	const isRenaming = renamingId === folder.id;

	const handleClick = (toggle: () => void) =>
		handleClickDetection(
			() => {
				toggle();
			},
			() => {
				if (!isRenameAllowed) {
					return;
				}
				setNewName(folder.title);
				setRenamingId(folder.id);
			},
		);

	const handleContextMenuOpen: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		open(ev.clientX, ev.clientY, undefined, folder.id);
	};

	return (
		<UiAdaptiveAccordion
			renderHeader={({ toggle, isOpen }) => (
				<button
					className={styles.header}
					onClick={handleClick(toggle)}
					onPointerEnter={handlePointerEnter}
					onPointerLeave={handlePointerLeave}
					onContextMenu={handleContextMenuOpen}
				>
					<span className={styles.icon}>
						{!isHover && (
							<Icon
								width={20}
								height={20}
								iconName={folderIcons[folder.type]}
							/>
						)}
						{isHover && (
							<Icon
								width={20}
								height={20}
								iconName={isOpen ? "ArrowUp" : "ArrowDown"}
							/>
						)}
					</span>
					{isRenaming ? <RenameInput /> : <span>{folder.title}</span>}
				</button>
			)}
			renderContent={() => (
				<div className={styles.contentWrapper}>
					<div className={styles.content}>
						{folder.items.length > 0 ? (
							<TransitionGroup component={null}>
								{folder.items.map(i => (
									<CSSTransition
										key={i.id}
										timeout={500}
										classNames={{
											enter: styles.fadeEnter,
											enterActive: styles.fadeEnterActive,
											exit: styles.fadeExit,
											exitActive: styles.fadeExitActive,
										}}
									>
										{i.itemType === "board" ? (
											<FolderItem
												folder={folder}
												key={i.id}
												board={i}
												handleOpenBoard={
													handleOpenBoard
												}
											/>
										) : (
											<Folder key={i.id} folder={i} />
										)}
									</CSSTransition>
								))}
							</TransitionGroup>
						) : (
							<span className={styles.noContent}>
								No boards available yet
							</span>
						)}
					</div>
				</div>
			)}
		/>
	);
}
