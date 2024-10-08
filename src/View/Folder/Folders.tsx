import React, { CSSProperties, useRef } from "react";
import { Folder, FolderItem } from "View/Folder";
import { Icon } from "View/Icon";
import { BoardName } from "View/BoardName";
import { useTranslation } from "react-i18next";
import { boardsApi } from "shared/api";

interface FoldersProps {
	containerClassName: string;
	customHeaderStyle?: CSSProperties;
	customListStyle?: CSSProperties;
	customFolderItemStyle?: CSSProperties;
	isAuth: boolean;
	isPublicOpened: boolean;
	isSharedOpened: boolean;
	currBoardId?: string;
	publicBoards: boardsApi.Board[];
	sharedBoards: boardsApi.Board[];
	activeBoardFunction?: (board: boardsApi.Board) => boolean;
	boardNameOnClick: (board: boardsApi.Board) => void;
	boardNameOnClickContext?: (
		board: boardsApi.Board,
	) => (event: React.MouseEvent) => void;
	boardNameOnDoubleClick?: (
		board: boardsApi.Board,
	) => (event: React.MouseEvent) => void;
	boardNameChildren: (board: boardsApi.Board) => React.ReactNode;
}

const Folders: React.FC<FoldersProps> = ({
	containerClassName,
	customHeaderStyle,
	customListStyle,
	customFolderItemStyle,
	isAuth,
	isPublicOpened,
	isSharedOpened,
	// Misnaming, in fact contains both private and public boards
	publicBoards,
	sharedBoards,
	activeBoardFunction,
	boardNameOnClick,
	boardNameOnClickContext,
	boardNameOnDoubleClick,
	boardNameChildren,
	currBoardId,
}) => {
	const { t } = useTranslation();

	const draftBoards = publicBoards.filter(board => board.isPublic);
	const privateBoards = publicBoards.filter(board => !board.isPublic);

	const sharedBoardsRefs = useRef<HTMLLIElement[]>([]);
	const scrollToElem = (scrollToN: number) => {
		for (let i = scrollToN - 1; i >= 0; i--) {
			if (sharedBoardsRefs.current[i]) {
				sharedBoardsRefs.current[i].scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
				return;
			}
		}
	};
	return (
		<div className={containerClassName}>
			{isAuth && (
				<Folder
					title={t("sidePanel.folders.myBoards")}
					icon={<Icon iconName="myBoards" width={20} height={20} />}
					isOpened={isPublicOpened}
					customHeader={customHeaderStyle}
					customList={customListStyle}
					currBoardId={currBoardId}
				>
					{privateBoards.map(board => (
						<FolderItem
							key={board.id}
							customStyle={customFolderItemStyle}
						>
							<BoardName
								active={
									activeBoardFunction
										? activeBoardFunction(board)
										: undefined
								}
								onClick={() => boardNameOnClick(board)}
								onClickContext={
									boardNameOnClickContext
										? boardNameOnClickContext(board)
										: undefined
								}
								onDoubleClick={
									boardNameOnDoubleClick
										? boardNameOnDoubleClick(board)
										: undefined
								}
							>
								{boardNameChildren(board)}
							</BoardName>
						</FolderItem>
					))}
					<Folder
						title={t("sidePanel.folders.publicDrafts")}
						icon={
							<Icon
								iconName="publicDrafts"
								width={20}
								height={20}
							/>
						}
						isOpened={isPublicOpened}
						customHeader={customHeaderStyle}
						customList={customListStyle}
					>
						{draftBoards.map(board => (
							<FolderItem
								key={board.id}
								customStyle={customFolderItemStyle}
							>
								<BoardName
									active={
										activeBoardFunction
											? activeBoardFunction(board)
											: undefined
									}
									onClick={() => boardNameOnClick(board)}
									onClickContext={
										boardNameOnClickContext
											? boardNameOnClickContext(board)
											: undefined
									}
									onDoubleClick={
										boardNameOnDoubleClick
											? boardNameOnDoubleClick(board)
											: undefined
									}
								>
									{boardNameChildren(board)}
								</BoardName>
							</FolderItem>
						))}
					</Folder>
				</Folder>
			)}
			{!isAuth && (
				<Folder
					title={t("sidePanel.folders.publicDrafts")}
					icon={
						<Icon iconName="publicDrafts" width={20} height={20} />
					}
					isOpened={isPublicOpened}
					customHeader={customHeaderStyle}
					customList={customListStyle}
					currBoardId={currBoardId}
				>
					{publicBoards.map(board => (
						<FolderItem
							key={board.id}
							customStyle={customFolderItemStyle}
						>
							<BoardName
								active={
									activeBoardFunction
										? activeBoardFunction(board)
										: undefined
								}
								onClick={() => boardNameOnClick(board)}
								onClickContext={
									boardNameOnClickContext
										? boardNameOnClickContext(board)
										: undefined
								}
								onDoubleClick={
									boardNameOnDoubleClick
										? boardNameOnDoubleClick(board)
										: undefined
								}
							>
								{boardNameChildren(board)}
							</BoardName>
						</FolderItem>
					))}
				</Folder>
			)}
			<Folder
				title={t("sidePanel.folders.sharedBoards")}
				icon={<Icon iconName="sharedBoards" width={20} height={20} />}
				isOpened={isSharedOpened}
				customHeader={customHeaderStyle}
				customList={customListStyle}
				onToggle={isOpen => {
					if (!isOpen) {
						setTimeout(() => {
							scrollToElem(3);
						}, 500);
					}
				}}
				currBoardId={currBoardId}
			>
				{sharedBoards.map((board, idx) => (
					<FolderItem
						key={board.id}
						customStyle={customFolderItemStyle}
						ref={el => {
							if (el) {
								sharedBoardsRefs.current[idx] = el;
							}
						}}
					>
						<BoardName
							active={
								activeBoardFunction
									? activeBoardFunction(board)
									: undefined
							}
							onClick={() => boardNameOnClick(board)}
							onClickContext={
								boardNameOnClickContext
									? boardNameOnClickContext(board)
									: undefined
							}
							onDoubleClick={
								boardNameOnDoubleClick
									? boardNameOnDoubleClick(board)
									: undefined
							}
						>
							{boardNameChildren(board)}
						</BoardName>
					</FolderItem>
				))}
			</Folder>
		</div>
	);
};

export default Folders;
