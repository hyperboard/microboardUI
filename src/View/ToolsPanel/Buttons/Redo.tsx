import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard/hotkey";
import React from "react";
import { useTranslation } from "react-i18next";
import { RedoIcon } from "View/Icon/RedoIcon";
import { UiButton } from "View/Ui/UiButton";

type Props = { board: Board; isOn: boolean };

export function Redo({ board, isOn }: Props) {
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.events.undo();
	};

	return (
		<UiButton
			id="Redo"
			onClick={handleClick}
			title={t("toolsPanel.redo.tooltip")}
			hotkey={getHotkeyLabel("redo")}
			isOn={false}
			tipOnLeft
		>
			<RedoIcon isOn={isOn} width={24} height={24} />
		</UiButton>
	);
}
