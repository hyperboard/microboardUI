import { Icon } from "shared/ui-lib/Icon/Icon";
import React from "react";
import { useTranslation } from "react-i18next";
import { UiButton } from "shared/ui-lib/UiButton/index";
import { useUiModalContext } from "shared/ui-lib/UiModal/UiModalContext";
import { CREATE_CARDS_MODAL } from "../../../GameItems/CreateCardsModal";

interface Props {
	rounded?: "top" | "bottom" | "none";
}

export function AddCard({ rounded = "none" }: Props): JSX.Element {
	const { t } = useTranslation();
	const { openModal } = useUiModalContext();

	const handleClick = (): void => {
		openModal(CREATE_CARDS_MODAL);
	};

	return (
		<UiButton
			id={`tool-add-card`}
			tooltip={t("toolsPanel.addGameItem.addCard.tooltip")}
			onClick={handleClick}
			rounded={rounded}
			variant="secondary"
		>
			<Icon iconName="Card" width={24} height={24} />
		</UiButton>
	);
}
