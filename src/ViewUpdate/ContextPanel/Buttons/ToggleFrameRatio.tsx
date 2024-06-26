import type { Frame } from "Board/Items";
import React from "react";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { UiButton } from "ViewUpdate/Ui/UiButton/UiButton";

export function ToggleFrameRatio(): React.ReactElement | null {
	const { board } = useAppContext();

	const frame = board.selection.items.getSingle() as Frame;
	const canChange = frame.getCanChangeRatio();

	const handleClick = (): void => {
		frame.setCanChangeRatio(!canChange);
	};

	return (
		<UiButton
			id={"switch-pointers"}
			onClick={handleClick}
			variant="secondary"
			rounded="none"
			active={!canChange}
		>
			<Icon
				iconName={canChange ? "LockFrameUnlocked" : "LockFrameLocked"}
			/>
		</UiButton>
	);
}
