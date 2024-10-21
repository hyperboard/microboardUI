import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { getHotkeyLabel } from "Board/Keyboard";

type Props = {
	rounded?: "none" | "left" | "right";
};

export function Duplicate({ rounded = "none" }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.selection.duplicate();
	};
	return (
		<UiButton
			id={"duplicate"}
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
			hotkey={getHotkeyLabel("duplicate")}
			tooltip={t("contextPanel.duplicate.tooltip")}
			tooltipPosition="top"
		>
			<Icon iconName="Duplicate" />
		</UiButton>
	);
}
