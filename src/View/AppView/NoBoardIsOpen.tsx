import React from "react";
import { useTranslation } from "react-i18next";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import styles from "./NoBoardIsOpen.module.css";
import { useBoardRenameContext } from "View/BoardName";

const NoBoardIsOpen: React.FC = () => {
	const { t } = useTranslation();
	const { openMenu, handleAddNew } = useSidePanelContext();
	const { setNewBoardName, setRenamingBoardId } = useBoardRenameContext();

	const handleOpenMenu: React.MouseEventHandler = event => {
		event.stopPropagation();
		event.preventDefault();
		openMenu();
	};

	const handleCreateNewBoard: React.MouseEventHandler = event => {
		handleAddNew(boardId => {
			handleOpenMenu(event);
			setNewBoardName(t("board.untitled"));
			setRenamingBoardId(boardId);
		});
	};

	return (
		<div className={styles.container}>
			<div className={styles.innerContainer}>
				<span className={styles.title}>{t("noBoard.title")}</span>
				<ul className={styles.list}>
					<li>
						<span>
							{t("noBoard.chooseBoard")}{" "}
							<button onClick={handleOpenMenu}>
								{t("noBoard.chooseBoardButton")}
							</button>
						</span>
					</li>
					<li>
						<span>
							<button onClick={handleCreateNewBoard}>
								{t("noBoard.createNewBoard")}
							</button>
						</span>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default NoBoardIsOpen;
