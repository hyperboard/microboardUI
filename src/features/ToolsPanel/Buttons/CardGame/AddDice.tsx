import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function AddDice() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addRegisteredTool("AddDice", true);
	};

	const isActive = Boolean(board.tools.getAddRegisteredTool("AddDice"));

	return (
		<UiButton
			id={"tool-add-dice"}
			tooltip={isActive ? undefined : t("toolsPanel.addText.tooltip")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="Auto" />
		</UiButton>
	);
}
