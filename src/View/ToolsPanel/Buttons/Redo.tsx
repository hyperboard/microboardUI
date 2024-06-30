import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";

export function Redo() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.events?.redo();
	};

	const canRedo = board.events?.canRedo();

	return (
		<UiButton
			id={"redo"}
			tooltip={t("toolsPanel.redo.tooltip")}
			hotkey={getHotkeyLabel("redo")}
			onClick={handleClick}
			disabled={!canRedo}
			rounded="bottom"
			variant="secondary"
		>
			<Icon iconName="Redo" />
		</UiButton>
	);
}
