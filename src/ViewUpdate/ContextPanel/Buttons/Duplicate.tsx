import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";

type Props = {
	rounded?: "none" | "left";
};

export function Duplicate({ rounded = "none" }: Props) {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.selection.duplicate();
	};

	return (
		<UiButton
			id={"duplicate"}
			onClick={handleClick}
			variant="secondary"
			rounded={rounded}
			tooltip={t("contextPanel.duplicate.tooltip")}
			tooltipPosition="top"
		>
			<Icon iconName="Duplicate" />
		</UiButton>
	);
}
