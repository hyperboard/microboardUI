import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { UndoIcon } from "View/Icon/UndoIcon";
import { UiButton } from "View/Ui/UiButton";

type Props = { board: Board; isOn: boolean };

export function Undo({ board, isOn }: Props) {
	const { t } = useTranslation();
	const handleClick = (): void => {
		board.events?.undo();
	};

	return (
		<UiButton
			id="Undo"
			onClick={handleClick}
			title={t("toolsPanel.undo.tooltip")}
			hotkey={getHotkeyLabel("undo")}
			isOn={false}
			tipOnLeft
		>
			<UndoIcon isOn={isOn} width={24} height={24} />
		</UiButton>
	);
}
