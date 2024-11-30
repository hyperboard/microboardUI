import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function Grab() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.navigate();
	};

	const isActive = Boolean(board.tools.getNavigate());

	return (
		<UiButton
			id={"tool-select"}
			tooltip={isActive ? undefined : t("toolsPanel.grab.tooltip")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded="top"
		>
			<Icon iconName="Hand" />
		</UiButton>
	);
}
