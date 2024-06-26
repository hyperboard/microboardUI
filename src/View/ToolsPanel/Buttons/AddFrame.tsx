import { Board } from "Board";
import { FrameType } from "Board/Items/Frame/Basic";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { FramePicker } from "View/Pickers/FramePicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

export function AddFrame({ board, isOn }: Props) {
	const { t } = useTranslation();

	const handlePick = (type: FrameType): void => {
		const addFrame = board.tools.getAddFrame();
		if (addFrame) {
			addFrame.setShapeType(type);
			addFrame.addNextTo();
		}
	};

	const handleButtonClick = (): void => {
		board.tools.addFrame(true);
	};

	return (
		<div className="ToolsPanelMenuContainer">
			<UiButton
				id="AddFrame"
				onClick={handleButtonClick}
				title={t("toolsPanel.addFrame.tooltip")}
				hotkey="F"
				isOn={isOn}
				tipOnLeft
			>
				<Icon name="AddFrame" width={24} height={24} />
			</UiButton>
			<div
				id="AddFrameMenu"
				className="ToolsPanelMenu"
				style={{
					width: "120px",
					visibility: isOn ? "visible" : "hidden",
					marginTop: "-77px",
				}}
			>
				<FramePicker onPick={handlePick} />
			</div>
		</div>
	);
}
