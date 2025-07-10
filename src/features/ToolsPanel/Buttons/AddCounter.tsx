import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";

export function AddCounter() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addRegisteredTool("AddCounter", true);
	};

	const isActive = Boolean(board.tools.getAddRegisteredTool("AddCounter"));

	return (
		<UiButton
			id={"redo"}
			tooltip={"Counter"}
			onClick={handleClick}
			variant="secondary"
			rounded="top"
			active={isActive}
		>
			<Icon iconName="Undo" />
		</UiButton>
	);
}
