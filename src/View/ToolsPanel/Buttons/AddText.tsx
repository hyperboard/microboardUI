import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function AddText() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addText(true);
	};

	const isActive = Boolean(board.tools.getAddText());

	return (
		<UiButton
			id={"tool-add-text"}
			tooltip={isActive ? undefined : t("toolsPanel.addText.tooltip")}
			hotkey={getHotkeyLabel("text")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded="none"
		>
			<Icon iconName="Text" />
		</UiButton>
	);
}
