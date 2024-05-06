import { Board } from "Board";
import { Mbr } from "Board/Items";
import React from "react";
import { useTranslation } from "react-i18next";
import { SwitchPointersIcon } from "View/Icon/SwitchPointersIcon";
import { UiButton } from "View/Ui/UiButton";

const IconSize = 24;

type SwitchPointersProps = {
	board: Board;
	toggleMenu: (menu: string) => void;
	menu: string;
	panelMbr: Mbr;
};

export function SwitchPointers({
	board,
}: SwitchPointersProps): React.ReactElement | null {
	const { t } = useTranslation();
	const canChangePointer = board.selection.items.isItemTypes(["Connector"]);
	if (
		board.selection.getContext() === "SelectUnderPointer" ||
		!canChangePointer
	) {
		return null;
	}

	const handleClick = () => {
		const start = board.selection.getStartPointerStyle();
		const end = board.selection.getEndPointerStyle();
		board.selection.setStartPointerStyle(end);
		board.selection.setEndPointerStyle(start);
	};

	return (
		<UiButton
			id="SwitchPointers"
			onClick={handleClick}
			title={t("contextPanel.connectorSwitchPointers.tooltip")}
		>
			<SwitchPointersIcon width={IconSize} height={IconSize} />
		</UiButton>
	);
}
