import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";

interface Props {
	rounded?: string;
}

export function ThrowDice({ rounded = "none" }: Props) {
	const { board } = useAppContext();

	const single = board.selection.items.getSingle();

	if (!single || single.itemType !== "Dice") {
		return null;
	}

	const handleClick = (): void => {
		const dice = single as Dice;
		dice.throwDice();
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
