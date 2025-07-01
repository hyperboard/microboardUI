import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/index";
import { UiButton } from "shared/ui-lib/UiButton/index";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
	rounded?: string;
}

export function AddDice({ rounded }: Props) {
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
			rounded={rounded}
		>
			<Icon iconName="Auto" />
		</UiButton>
	);
}
