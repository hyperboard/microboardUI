import { getHotkeyLabel } from "microboard-temp";
import { useAppSubscription } from "App/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";

export function Redo() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["board"], // previously used events subscription
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
