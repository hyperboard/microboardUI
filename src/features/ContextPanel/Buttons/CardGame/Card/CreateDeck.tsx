import { Icon } from "shared/ui-lib/Icon";
import React from "react";
import { useAppContext } from "features/AppContext";
import btnStyle from "../../ContextPanelButton.module.css";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import { Card, Deck } from "microboard-temp";
import { useTranslation } from "react-i18next";

interface Props {
	rounded?: string;
	onlyCards: boolean;
}

export function CreateDeck({ rounded = "none", onlyCards }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const single = board.selection.items.getSingle();
	if (single && single.itemType === "Deck") {
		return null;
	}

	const cardsOrDecks = board.selection.items.list();

	const handleClick = (): void => {
		if (onlyCards) {
			board.add(new Deck(board, "", undefined, cardsOrDecks));
		} else {
			let mainDeck: Deck | null = null;
			const cards: Card[] = [];
			cardsOrDecks.forEach(item => {
				if (item.itemType === "Card") {
					cards.push(item);
				} else if (item.itemType === "Deck") {
					if (mainDeck) {
						cards.push(...mainDeck.getDeck());
						board.remove(mainDeck);
						mainDeck = item;
					} else {
						mainDeck = item;
					}
				}
			});
			if (!mainDeck) {
				board.add(new Deck(board, "", undefined, cards));
				return;
			}
			mainDeck.addCards(cards);
			board.selection.items.removeAll();
		}
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id="create-deck"
			tooltip={t("contextPanel.gameItems.deck.create")}
			tooltipPosition="top"
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="Plus" />
		</UiButton>
	);
}
