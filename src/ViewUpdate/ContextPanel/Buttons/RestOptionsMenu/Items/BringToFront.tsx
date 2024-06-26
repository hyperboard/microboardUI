import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "ViewUpdate/Icon";
import { getHotkeyLabel } from "Board/Keyboard";

export function BringToFront() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleBringToFront = () => {
		board.selection.bringToFront();
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleBringToFront}
			icon={<Icon width={20} height={20} iconName="BringToFront" />}
			hotkey={getHotkeyLabel("bringToFront")}
		>
			{t("contextPanel.bringToFront.text")}
		</RestOptionsMenuItem>
	);
}
