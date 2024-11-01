import { getHotkeyLabel } from "Board/Keyboard";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";

export function Redo() {
	const { board, app } = useAppContext();
	const { t } = useTranslation();

	const forceUpdate = useForceUpdate();

	useAppSubscription(app, {
		subjects: ["events"],
		observer: forceUpdate,
	});

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
			variant="secondary"
			rounded="bottom"
		>
			<Icon iconName="Redo" />
		</UiButton>
	);
}
