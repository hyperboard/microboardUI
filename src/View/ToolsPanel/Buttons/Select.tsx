import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard/hotkey";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

export function Select({ board, isOn }: Props) {
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.tools.select();
	};

	return (
		<UiButton
			id="Select"
			onClick={handleClick}
			title={t("toolsPanel.select.tooltip")}
			hotkey={getHotkeyLabel("select")}
			isOn={isOn}
			tipOnLeft
		>
			<Icon name="Pointer" width={24} height={24} />
		</UiButton>
	);
}
