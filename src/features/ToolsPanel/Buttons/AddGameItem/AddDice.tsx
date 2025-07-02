import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/index";
import { UiButton } from "shared/ui-lib/UiButton/index";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";
import { CREATE_CARDS_MODAL } from "features/CardGame/CreateCardsModal";
import { CREATE_DICE_MODAL } from "features/CardGame/CreateDiceModal";

interface Props {
	rounded?: string;
}

export function AddDice({ rounded }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

	// const handleClick = () => {
	// 	board.tools.addRegisteredTool("AddDice", true);
	// };
	//
	// const isActive = Boolean(board.tools.getAddRegisteredTool("AddDice"));

	const { openModal } = useUiModalContext();

	const handleClick = (): void => {
		openModal(CREATE_DICE_MODAL);
	};

	return (
		<UiButton
			id={"tool-add-dice"}
			tooltip={false ? undefined : t("toolsPanel.addText.tooltip")}
			onClick={handleClick}
			active={false}
			variant="secondary"
			rounded={rounded}
		>
			<Icon iconName="Auto" />
		</UiButton>
	);
}
