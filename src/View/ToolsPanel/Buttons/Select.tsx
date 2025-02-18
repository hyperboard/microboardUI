import { getHotkeyLabel } from "Board/Keyboard";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = { rounded?: "top" | "bottom" | "none" };

export function Select({ rounded = "top" }: Props): JSX.Element {
	const { board } = useAppContext();
	const { t } = useTranslation();

	function handleClick(): void {
		if (board.tools.getSelect()) {
			board.tools.navigate();
		} else {
			board.tools.select();
		}
	}

	const isActive = Boolean(board.tools.getSelect());

	return (
		<UiButton
			id={"tool-select"}
			tooltip={isActive ? undefined : t("toolsPanel.select.tooltip")}
			hotkey={getHotkeyLabel("select")}
			onClick={handleClick}
			active={isActive}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="Select" />
		</UiButton>
	);
}
