import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { getHotkeyLabel } from "microboard-temp";
import { RestOptionsMenuItem } from "features/ContextPanel/Buttons/RestOptionsMenu/RestOptionsMenuItem";

export function Duplicate(): React.ReactElement {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.selection.duplicate();
	};

	return (
		<RestOptionsMenuItem
			onClick={handleClick}
			icon={<Icon width={20} height={20} iconName="Duplicate" />}
			hotkey={getHotkeyLabel("duplicate")}
		>
			{t("contextPanel.duplicate.tooltip")}
		</RestOptionsMenuItem>
	);
}
