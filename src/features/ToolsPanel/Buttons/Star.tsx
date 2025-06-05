import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { Star } from "Board/Items/Star/Star";

export function AddStar() {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const star = new Star(board, "");

	const handleClick = () => {
		board.tools.addRegisteredTool("AddStar", true);
	};

	const isActive = Boolean(board.tools.getAddRegisteredTool("AddStar"));

	return (
		<UiButton
			id={"redo"}
			tooltip={t("toolsPanel.redo.tooltip")}
			hotkey={getHotkeyLabel("redo")}
			onClick={handleClick}
			variant="secondary"
			rounded="bottom"
			active={isActive}
		>
			<Icon iconName="Redo" />
		</UiButton>
	);
}
