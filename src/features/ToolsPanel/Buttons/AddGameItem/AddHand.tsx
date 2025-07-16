import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";

export function AddHand() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addRegisteredTool("AddHand", true);
	};

	const isActive = Boolean(board.tools.getAddRegisteredTool("AddHand"));

	return (
		<UiButton
			id={"redo"}
			tooltip={"Hand"}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
			active={isActive}
		>
			<Icon iconName="Redo" />
		</UiButton>
	);
}
