import React from "react";
import { UiButton } from "View/Ui/UiButton/UiButton";
import { Icon } from "View/Icon/Icon";
import { useTranslation } from "react-i18next";
import { useHyperLinkContext } from "View/hyperLink/HyperLinkContext";

export const HyperLinkBtn = () => {
	const { t } = useTranslation();
	const { setIsEditingLink, isEditingLink, hyperLinkData } =
		useHyperLinkContext();

	const toggleIsEditing = () => {
		setIsEditingLink(!isEditingLink);
	};

	return (
		<UiButton
			id="Hyperlink"
			tooltip={t("contextPanel.hyperLink.tooltip")}
			onClick={toggleIsEditing}
			variant="secondary"
			tooltipPosition="top"
			rounded="none"
			disabled={!hyperLinkData}
			active={isEditingLink}
		>
			<Icon iconName="Hyperlink" />
		</UiButton>
	);
};
