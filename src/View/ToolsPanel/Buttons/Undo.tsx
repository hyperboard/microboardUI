import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";

export function Undo() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["events"],
		observer: forceUpdate,
	});

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
