import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const Lock = (): React.ReactElement | null => {
	const { t } = useTranslation();
	const [isLocked, setIsLocked] = useState(false);

	const handleClick = (): void => {
		setIsLocked(isLocked => !isLocked);
	};

	const tooltip = isLocked
		? t("contextPanel.unlock.tooltip")
		: t("contextPanel.lock.tooltip");

	const icon = isLocked ? (
		<Icon iconName="unlock" />
	) : (
		<Icon iconName="lock" />
	);

	return (
		<UiButton
			id={"lock"}
			onClick={handleClick}
			active={isLocked}
			variant="secondary"
			rounded="none"
			tooltip={tooltip}
			tooltipPosition="top"
		>
			{icon}
		</UiButton>
	);
};
