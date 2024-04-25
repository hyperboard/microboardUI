import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard/hotkey";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";

type Props = { board: Board; isOn: boolean };

export function AddText({ board, isOn }: Props) {
	const { t } = useTranslation();
	const handleClick = (): void => {
		board.tools.addText();
	};

	return (
		<UiButton
			id="AddText"
			onClick={handleClick}
			title={t("toolsPanel.addText.tooltip")}
			hotkey={getHotkeyLabel("text")}
			isOn={isOn}
			tipOnLeft
		>
			<Icon name="RichText" width={24} height={24} />
		</UiButton>
	);
}
