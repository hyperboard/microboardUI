import React, { CSSProperties } from "react";
import { Folder, FolderItem } from "View/Folder";
import { Icon } from "View/Icon";
import { VisitedPublicBoard } from "App/Storage";
import { BoardName } from "View/BoardName";
import { useTranslation } from "react-i18next";

interface FoldersProps {
	containerClassName: string;
	customHeaderStyle?: CSSProperties;
	customListStyle?: CSSProperties;
	customFolderItemStyle?: CSSProperties;
	isAuth: boolean;
	isPublicOpened: boolean;
	isSharedOpened: boolean;
	currBoardId?: string;
	publicBoards: VisitedPublicBoard[];
	sharedBoards: VisitedPublicBoard[];
	activeBoardFunction?: (board: VisitedPublicBoard) => boolean;
	boardNameOnClick: (board: VisitedPublicBoard) => void;
	boardNameOnClickContext?: (
		board: VisitedPublicBoard,
	) => (event: React.MouseEvent) => void;
	boardNameOnDoubleClick?: (
		board: VisitedPublicBoard,
	) => (event: React.MouseEvent) => void;
	boardNameChildren: (board: VisitedPublicBoard) => React.ReactNode;
}

const Folders: React.FC<FoldersProps> = ({
	containerClassName,
	customHeaderStyle,
	customListStyle,
	customFolderItemStyle,
	isAuth,
	isPublicOpened,
	isSharedOpened,
	currBoardId,
	publicBoards,
	sharedBoards,
	activeBoardFunction,
	boardNameOnClick,
	boardNameOnClickContext,
	boardNameOnDoubleClick,
	boardNameChildren,
}) => {
	const { t } = useTranslation();

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
						currBoardId={currBoardId}
					>
						{publicBoards.map(board => (
							<FolderItem
								key={board.boardId}
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
							key={board.boardId}
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
				currBoardId={currBoardId}
			>
				{sharedBoards.map(board => (
					<FolderItem
						key={board.boardId}
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
		</div>
	);
};

export default Folders;
