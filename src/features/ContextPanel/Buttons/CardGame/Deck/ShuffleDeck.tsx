import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { useTranslation } from "react-i18next";

interface Props {
	rounded?: string;
}

export function ShuffleDeck({ rounded = "none" }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

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
			id="shuffle-deck"
			tooltip={t("contextPanel.gameItems.deck.shuffle")}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="publicDrafts" />
		</UiButton>
	);
}
