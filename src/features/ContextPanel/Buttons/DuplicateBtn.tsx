import { useAppContext } from "features/AppContext";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "shared/ui-lib/Icon/index";
import { UiButton } from "shared/ui-lib/UiButton/UiButton";
import btnStyle from "./ContextPanelButton.module.css";

interface Props {
	rounded?: string;
}

export function DuplicateBtn({ rounded = "none" }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = (): void => {
		board.selection.duplicate();
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
