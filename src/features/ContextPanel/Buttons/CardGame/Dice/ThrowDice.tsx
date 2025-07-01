import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Dice } from "microboard-temp";

interface Props {
	rounded?: string;
}

export function ThrowDice({ rounded = "none" }: Props) {
	const { board } = useAppContext();

	const dices = board.selection.items.list() as Dice[];

	const handleClick = (): void => {
		dices.forEach((dice: Dice): void => {
			dice.throwDice();
		});
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id="ThrowDice"
			tooltip={"ThrowDice"}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="ToggleCursors" />
		</UiButton>
	);
}
