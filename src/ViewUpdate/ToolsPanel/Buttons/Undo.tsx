import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

export function Undo() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.events?.undo();
	};

	const canUndo = board.events?.canUndo();

	return (
		<UiButton
			id={"undo"}
			tooltip={t("toolsPanel.undo.tooltip")}
			hotkey={getHotkeyLabel("undo")}
			onClick={handleClick}
			disabled={!canUndo}
			rounded="top"
			variant="secondary"
		>
			<Icon iconName="Undo" />
		</UiButton>
	);
}
