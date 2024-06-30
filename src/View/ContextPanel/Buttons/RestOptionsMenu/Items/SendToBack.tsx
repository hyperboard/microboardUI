import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { usePanelContext } from "View/ContextPanel/PanelContext";
import { RestOptionsMenuItem } from "../RestOptionsMenuItem";
import React from "react";
import { Icon } from "View/Icon";
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
