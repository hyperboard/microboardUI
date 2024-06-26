import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

export function SwitchPointers(): React.ReactElement | null {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const handleClick = () => {
		const start = board.selection.getStartPointerStyle();
		const end = board.selection.getEndPointerStyle();
		board.selection.setStartPointerStyle(end);
		board.selection.setEndPointerStyle(start);
	};

	return (
		<UiButton
			id={"switch-pointers"}
			tooltip={t("contextPanel.connectorSwitchPointers.tooltip")}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="Switch" />
		</UiButton>
	);
}
