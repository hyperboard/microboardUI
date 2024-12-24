import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import btnStyle from "./ContextPanelButton.module.css";

type Props = {
	rounded?: "left" | "right" | "none" | "full";
};

export function Delete({ rounded = "none" }: Props): React.ReactElement {
	const { board } = useAppContext();
	const { t } = useTranslation();
	const handleClick = (): void => {
		board.selection.removeFromBoard();
	};

	return (
		<UiButton
			className={btnStyle.contextPanelButton}
			id={"delete"}
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
			tooltip={t("contextPanel.delete.tooltip")}
			tooltipPosition="top"
		>
			<Icon iconName="Delete" />
		</UiButton>
	);
}
