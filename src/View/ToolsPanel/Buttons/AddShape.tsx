import { Board } from "Board";
import { getHotkeyLabel } from "Board/Keyboard/hotkeys";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "View/Icon";
import { ShapePicker } from "View/Pickers/ShapeTypePicker";
import { UiButton } from "View/Ui/UiButton";

type Props = {
	board: Board;
	isOn: boolean;
};

export function AddShape({ board, isOn }: Props) {
	const { t } = useTranslation();
	const handleClick = (): void => {
		board.tools.addShape();
	};

	const handlePick = (type: string): void => {
		const addShape = board.tools.getAddShape();
		if (addShape) {
			addShape.setShapeType(type);
		}
	};

	return (
		<div className="ToolsPanelMenuContainer">
			<UiButton
				id="AddShape"
				onClick={handleClick}
				title={t("toolsPanel.addShape.tooltip")}
				hotkey={getHotkeyLabel("shape")}
				isOn={isOn}
				tipOnLeft
			>
				<Icon name="Rectangle" width={24} height={24} />
			</UiButton>
			<div
				id="AddShapeMenu"
				className="ToolsPanelMenu"
				style={{
					width: "140px",
					visibility: isOn ? "visible" : "hidden",
					marginTop: "-194px",
				}}
			>
				<ShapePicker onPick={handlePick} />
			</div>
		</div>
	);
}
