import { useAccount } from "App/useAccount";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon/Icon";
import { notify } from "shared/ui-lib/Toast/index";
import React, { useRef } from "react";
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
			tooltip="Add Card"
			onClick={handleClick}
			rounded={rounded}
			variant="secondary"
		>
			<Icon iconName="BoxedPlus" width={20} height={20} />
		</UiButton>
	);
}
