import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton";
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
			tooltip={t("toolsPanel.addText.tooltip")}
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
