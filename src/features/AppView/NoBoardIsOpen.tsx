import React from "react";
import { useTranslation } from "react-i18next";
import { useRenameContext } from "features/Rename";
import { useSidePanelContext } from "features/SidePanel/SidePanelContext";
import styles from "./NoBoardIsOpen.module.css";

const NoBoardIsOpen: React.FC = () => {
	const { t } = useTranslation();
	const { openMenu, handleAddNew, isOpen } = useSidePanelContext();
	const { setRenamingId, setNewName } = useRenameContext();

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
			setNewName(t("board.untitled"));
			setRenamingId(boardId);
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
