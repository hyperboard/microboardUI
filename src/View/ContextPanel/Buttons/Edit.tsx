import { Board } from "Board";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "View/Ui/UiButton";

type EditProps = { board: Board };

export function Edit({ board }: EditProps): React.ReactElement | null {
	const { t } = useTranslation();
	if (board.selection.getContext() !== "SelectUnderPointer") {
		return null;
	}

	const handleClick = () => {
		board.selection.editSelected();
	};

	return (
		<UiButton id="ContextPanelEdit" onClick={handleClick} title="Edit">
			{t("contextPanel.edit.text")}
		</UiButton>
	);
}
