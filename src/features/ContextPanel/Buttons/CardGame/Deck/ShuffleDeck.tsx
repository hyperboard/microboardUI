import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";

interface Props {
	rounded?: string;
}

export function ShuffleDeck({ rounded = "none" }: Props) {
	const { board } = useAppContext();

	const single = board.selection.items.getSingle();

	if (!single || single.itemType !== "Deck") {
		return null;
	}

	const handleClick = (): void => {
		single.shuffleDeck();
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id="shuffleDeck"
			tooltip={"shuffleDeck"}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="publicDrafts" />
		</UiButton>
	);
}
