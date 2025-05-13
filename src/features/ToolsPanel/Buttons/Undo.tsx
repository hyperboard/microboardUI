import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";

export function Undo() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["board"], // previously used events subscription
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
