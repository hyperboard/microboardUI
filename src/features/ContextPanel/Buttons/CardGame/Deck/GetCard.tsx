import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card } from "Board/Items/Examples/CardGame/Card/Card";
import { Deck } from "Board/Items/Examples/CardGame/Deck/Deck";

interface Props {
	cardPosition: "random" | "top" | "bottom";
	rounded?: string;
}

export function GetCard({ cardPosition, rounded = "none" }: Props) {
	const { board } = useAppContext();

	const single = board.selection.items.getSingle();

	if (!single || single.itemType !== "Deck") {
		return null;
	}

	const handleClick = (): void => {
		let card: Card;
		const deck = single as Deck;
		switch (cardPosition) {
			case "random":
				card = deck.getRandomCard();
				break;
			case "top":
				card = deck.getTopCard();
				break;
			case "bottom":
				card = deck.getBottomCard();
				break;
			default:
				card = deck.getRandomCard();
				break;
		}
		const { left, top } = deck.getMbr();
		card.transformation.translateTo(left, top - 200);
		if (deck.getDeck().length === 0) {
			board.remove(deck);
		}
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id={`getCard-${cardPosition}`}
			tooltip={`getCard-${cardPosition}`}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="Play" />
		</UiButton>
	);
}
