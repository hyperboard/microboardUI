import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function Select() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.select(true);
	};

	const isActive = Boolean(board.tools.getSelect());

	return (
		<UiButton
			id={"tool-select"}
			tooltip={t("toolsPanel.select.tooltip")}
			hotkey={getHotkeyLabel("select")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded="top"
		>
			<Icon iconName="Select" />
		</UiButton>
	);
}
