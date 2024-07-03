import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "View/AppContext";
import { Icon } from "View/Icon";
import { UiButton } from "View/Ui/UiButton/UiButton";

export function ToggleFrameRatio(): React.ReactElement | null {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const canChange = board.selection.getCanChangeRatio();

	const handleClick = (): void => {
		board.selection.setCanChangeRatio(!canChange);
	};

	return (
		<UiButton
			id={"switch-pointers"}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
			active={!canChange}
			tooltip={
				canChange
					? t("contextPanel.lockFrameRatio.tooltip.lock")
					: t("contextPanel.lockFrameRatio.tooltip.unlock")
			}
			tooltipPosition="top"
		>
			<Icon
				iconName={canChange ? "LockFrameUnlocked" : "LockFrameLocked"}
			/>
		</UiButton>
	);
}
