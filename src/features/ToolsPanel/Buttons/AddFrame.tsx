import type { FrameType } from "Board/Items/Frame/Basic";
import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "features/AppContext";
import { Icon } from "shared/ui-lib/Icon";
import { FramePicker } from "features/Pickers/FramePicker";
import { UiPanel } from "shared/ui-lib/UiPanel";
import { ButtonWithMenu } from "./ButtonWithMenu";
import { UiButton } from "shared/ui-lib/UiButton";

export function AddFrame() {
	const { board } = useAppContext();
	const { t } = useTranslation();

	const handleClick = () => {
		board.tools.addFrame(true);
	};

	const handlePick = (type: FrameType) => {
		const addFrame = board.tools.getAddFrame();
		if (addFrame) {
			addFrame.setShapeType(type);
			addFrame.addNextTo();
		}
	};

	const isActive = Boolean(board.tools.getAddFrame());
	const selected = board.tools.getAddFrame()?.shape;
	return (
		<ButtonWithMenu
			isOpen={isActive}
			button={
				<UiButton
					id={"tool-frame"}
					tooltip={
						isActive ? undefined : t("toolsPanel.addFrame.tooltip")
					}
					hotkey={getHotkeyLabel("frame")}
					onClick={handleClick}
					active={isActive}
					variant="secondary"
					rounded="none"
				>
					<Icon iconName="Frame" />
				</UiButton>
			}
		>
			<UiPanel gap={4} grid columns={4}>
				<FramePicker
					onPick={handlePick}
					selected={selected ?? "Custom"}
				/>
			</UiPanel>
		</ButtonWithMenu>
	);
}
