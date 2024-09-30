import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton";
import React from "react";
import { useTranslation } from "react-i18next";
import { Frame } from "Board/Items";

type Props = {
	rounded?: "none" | "left";
};

export const Lock = ({
	rounded = "none",
}: Props): React.ReactElement | null => {
	const { t } = useTranslation();
	const { board } = useAppContext();
	const selectedFrames = board.selection.list() as Frame[];
	const isLocked = selectedFrames.some(
		frame => frame.transformation.isLocked,
	);

	const handleClick = (): void => {
		selectedFrames.forEach(frame => {
			const isLockedFrame = frame.transformation.isLocked;
			frame.transformation.setIsLocked(!isLockedFrame);
		});
	};

	const tooltip = isLocked
		? t("contextPanel.unlock.tooltip")
		: t("contextPanel.lock.tooltip");

	const icon = isLocked ? (
		<Icon iconName="lock" />
	) : (
		<Icon iconName="unlock" />
	);

	return (
		<UiButton
			id={"lock"}
			onClick={handleClick}
			active={isLocked}
			variant="secondary"
			rounded={rounded}
			tooltip={tooltip}
			tooltipPosition="top"
		>
			{icon}
		</UiButton>
	);
};
