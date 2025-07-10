import { useAppContext } from "features/AppContext";
import { Dice } from "microboard-temp";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import btnStyle from "../../ContextPanelButton.module.css";

interface Props {
	rounded?: string;
}

export function ThrowDice({ rounded = "none" }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const dices = board.selection.items.list() as Dice[];

	const handleClick = (): void => {
		dices.forEach((dice: Dice): void => {
			dice.throwDice();
		});
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id="throw-dice"
			tooltip={t("contextPanel.gameItems.dice.throw")}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="ToggleCursors" />
		</UiButton>
	);
}
