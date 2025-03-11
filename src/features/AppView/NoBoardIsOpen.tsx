import React from "react";
import { useTranslation } from "react-i18next";
import { useRenameContext } from "features/Rename";
import { useSidePanelContext } from "features/SidePanel/SidePanelContext";
import styles from "./NoBoardIsOpen.module.css";
import { Button } from "shared/ui-lib/Button";

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
				<div className={styles.btns}>
					<Button
						className={styles.btn}
						pattern="secondary"
						onClick={handleOpenMenu}
					>
						{t("noBoard.chooseBoard")}
					</Button>
					<Button
						className={styles.btn}
						pattern="quaternary"
						onClick={handleCreateNewBoard}
					>
						{t("noBoard.createNewBoard")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NoBoardIsOpen;
