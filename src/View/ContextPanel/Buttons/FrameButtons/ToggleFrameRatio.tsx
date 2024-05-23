import React from "react";
import { Board } from "Board";
import { UiButton } from "View/Ui/UiButton";
import { canShowFrameSetting } from ".";
import { IconSize } from "View/ContextPanel/ContextPanel";
import { Frame } from "Board/Items";
import { LockIcon } from "View/Icon/LockIcon";
import { UnlockIcon } from "View/Icon/UnlockIcon";

export default function ToggleFrameRatio({
	board,
	toggleMenu,
}: {
	board: Board;
	toggleMenu: (menu: string) => void;
}): React.ReactElement | null {
	if (!canShowFrameSetting(board)) {
		return null;
	}
	const frame = board.selection.items.getSingle() as Frame;
	const canChange = frame.getCanChangeRatio();

	const handleClick = (): void => {
		toggleMenu("ShareLink");
		frame.setCanChangeRatio(!canChange);
	};

	return (
		<UiButton
			id="ToggleRatio"
			onClick={handleClick}
			title={`Press to ${canChange ? "freeze" : "unfreeze"}`}
		>
			{canChange ? (
				<UnlockIcon width={IconSize} height={IconSize} />
			) : (
				<LockIcon width={IconSize} height={IconSize} />
			)}
		</UiButton>
	);
}
