import { Board } from "Board";
import React from "react";
import { useTranslation } from "react-i18next";
import { DeleteIcon } from "View/Icon/DeleteIcon";
import { UiButton } from "View/Ui/UiButton";

type DeleteProps = { board: Board };

const IconSize = 24;

export function Delete({ board }: DeleteProps): React.ReactElement | null {
	const { t } = useTranslation();
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	const handleClick = () => {
		board.selection.removeFromBoard();
	};
	return (
		<UiButton
			id="DeleteSelection"
			onClick={handleClick}
			title={t("contextPanel.delete.tooltip")}
		>
			<DeleteIcon width={IconSize} height={IconSize} />
		</UiButton>
	);
}
