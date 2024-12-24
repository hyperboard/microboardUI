import { useBoardsList } from "App/useBoardsList";
import React, { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "shared/ui-lib/Button";
import { useAppContext } from "View/AppContext";
import { useContextMenuContext } from "View/ContextMenu";
import { Icon } from "View/Icon";
import { SHARE_MODAL_ID } from "View/ShareModal/ShareModal";
import { useUiModalContext } from "View/Ui/UiModal";
import commonStyles from "../../UserPanel.module.css";

export const ShareBtn: React.FC = () => {
	const { setIds } = useContextMenuContext();
	const { openModal } = useUiModalContext();
	const { board } = useAppContext();
	const { t } = useTranslation();
	const boardsList = useBoardsList();

	const boardId = board.getBoardId();
	const boardInfo = boardsList.getBoardInfo(boardId);

	const handleShare: MouseEventHandler = ev => {
		ev.preventDefault();
		ev.stopPropagation();
		setIds(boardId);
		openModal(SHARE_MODAL_ID);
	};
	if (boardId === "blank") {
		return null;
	}

	return (
		<Button
			onClick={handleShare}
			pattern="primary"
			className={commonStyles.shareButton}
		>
			<Icon
				width={16}
				height={16}
				iconName={boardInfo?.isPublic ? "publicDrafts" : "lock"}
				className={commonStyles.shareIcon}
			/>
			{t("sharing.share")}
		</Button>
	);
};
