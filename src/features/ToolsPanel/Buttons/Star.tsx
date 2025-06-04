import { getHotkeyLabel } from "Board/Keyboard";
import { useAppSubscription } from "Board/useBoardSubscription";
import { useForceUpdate } from "shared/lib/useForceUpdate";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { Star } from "Board/Items/Star/Star";

export function AddStar() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const forceUpdate = useForceUpdate();

	useAppSubscription({
		subjects: ["board"], // previously used events subscription
		observer: forceUpdate,
	});

	const handleClick = () => {
		const star = new Star(board, "");
		board.add(star);
	};

	return (
		<UiButton
			id={"redo"}
			tooltip={t("toolsPanel.redo.tooltip")}
			hotkey={getHotkeyLabel("redo")}
			onClick={handleClick}
			variant="secondary"
			rounded="bottom"
		>
			<Icon iconName="Redo" />
		</UiButton>
	);
}
