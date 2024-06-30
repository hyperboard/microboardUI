import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";

export function Delete() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const handleClick = () => {
		board.selection.removeFromBoard();
	};

	return (
		<UiButton
			id={"delete"}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
			tooltip={t("contextPanel.delete.tooltip")}
			tooltipPosition="top"
		>
			<Icon iconName="Delete" />
		</UiButton>
	);
}
