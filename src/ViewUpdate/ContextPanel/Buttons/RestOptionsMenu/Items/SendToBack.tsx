import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { usePanelContext } from "ViewUpdate/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "ViewUpdate/Icon";
import { getHotkeyLabel } from "Board/Keyboard";

export function SendToBack() {
	const { board } = useAppContext();
	const { toggleMenu } = usePanelContext();
	const { t } = useTranslation();

	const handleSendToBack = () => {
		board.selection.sendToBack();
		toggleMenu("None");
	};

	return (
		<RestOptionsMenuItem
			onClick={handleSendToBack}
			icon={<Icon width={20} height={20} iconName="SendToBack" />}
			hotkey={getHotkeyLabel("sendToBack")}
		>
			{t("contextPanel.sendToBack.text")}
		</RestOptionsMenuItem>
	);
}
