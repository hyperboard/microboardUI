import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";

export function SwitchPointers(): React.ReactElement | null {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const handleClick = (): void => {
		board.selection.switchPointers();
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
