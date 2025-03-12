import React from "react";
import { useTranslation } from "react-i18next";
import { useRenameContext } from "features/Rename";
import { useSidePanelContext } from "features/SidePanel/SidePanelContext";
import styles from "./NoBoardIsOpen.module.css";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";

const NoBoardIsOpen: React.FC = () => {
	const { t } = useTranslation();
	const { openMenu, handleAddNew, isOpen } = useSidePanelContext();
	const { setRenamingId, setNewName } = useRenameContext();
	const { board } = useAppContext();

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

	if (board.getBoardId() !== "blank") {
		return null;
	}

	return (
		<div className={styles.container}>
			<div className={styles.innerContainer}>
				<span className={styles.title}>{t("noBoard.title")}</span>
				<div className={styles.btns}>
					<UiButton
						className={styles.btn}
						variant="quaternary"
						onClick={handleOpenMenu}
						size="lg"
					>
						{t("noBoard.chooseBoard")}
					</UiButton>
					<UiButton
						className={styles.btn}
						onClick={handleCreateNewBoard}
						size="lg"
					>
						{t("noBoard.createNewBoard")}
					</UiButton>
				</div>
			</div>
		</div>
	);
};

export default NoBoardIsOpen;
