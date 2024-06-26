import type { FrameType } from "Board/Items/Frame/Basic";
import { getHotkeyLabel } from "Board/Keyboard";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "ViewUpdate/AppContext";
import { Icon } from "ViewUpdate/Icon";
import { FramePicker } from "ViewUpdate/Pickers/FramePicker";
import { UiButton } from "ViewUpdate/Ui/UiButton";
import { UiPanel } from "ViewUpdate/Ui/UiPanel";
import { ButtonWithMenu } from "./ButtonWithMenu";

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
					id={"tool-select"}
					tooltip={t("toolsPanel.addFrame.tooltip")}
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
			<UiPanel gap={4} grid columns={3}>
				<FramePicker onPick={handlePick} selected={selected} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
