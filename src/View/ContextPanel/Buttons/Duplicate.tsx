import { Board } from "Board";
import React from "react";
import { useTranslation } from "react-i18next";
import { DuplicateIcon } from "View/Icon/DuplicateIcon";
import { UiButton } from "View/Ui/UiButton";

type DuplicateProps = { board: Board };

const IconSize = 24;

export function Duplicate({
	board,
}: DuplicateProps): React.ReactElement | null {
	const { t } = useTranslation();
	if (board.selection.getContext() === "SelectUnderPointer") {
		return null;
	}

	const handleClick = () => {
		board.selection.duplicate();
	};

	return (
		<UiButton
			id="DuplicateSelection"
			onClick={handleClick}
			title={t("contextPanel.duplicate.tooltip")}
		>
			<DuplicateIcon width={IconSize} height={IconSize} />
		</UiButton>
	);
}
