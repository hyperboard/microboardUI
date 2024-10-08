import React from "react";
import { useTranslation } from "react-i18next";
import { useSidePanelContext } from "View/SidePanel/SidePanelContext";
import styles from "./NoBoardIsOpen.module.css";
import { useBoardRenameContext } from "View/BoardName";

const NoBoardIsOpen: React.FC = () => {
	const { t } = useTranslation();
	const { openMenu, handleAddNew, isOpen } = useSidePanelContext();
	const { setNewBoardName, setRenamingBoardId } = useBoardRenameContext();

	const handleOpenMenu: React.MouseEventHandler = event => {
		event.stopPropagation();
		event.preventDefault();
		if (isOpen) {
			openMenu(1500);
		} else {
			openMenu();
		}
	};

	const handleCreateNewBoard: React.MouseEventHandler = event => {
		event.preventDefault();
		event.stopPropagation();
		handleAddNew(boardId => {
			openMenu();
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
