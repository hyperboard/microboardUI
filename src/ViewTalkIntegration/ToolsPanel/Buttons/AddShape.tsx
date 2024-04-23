import { ShapeType } from "Board/Items/Shape/Basic";
import React from "react";
import { Icon } from "ViewTalkIntegration/Icon";
import { ShapePicker } from "ViewTalkIntegration/Pickers/ShapeTypePicker";
import { usePanelContext } from "ViewTalkIntegration/ToolsPanel/PanelContext";
import { UiButton } from "ViewTalkIntegration/Ui/UiButton/UiButton";
import { UiPanel } from "ViewTalkIntegration/Ui/UiPanel/UiPanel";
import { useTalkTranslation } from "ViewTalkIntegration/useTalkTranslation";
import { ButtonWithMenu } from "./ButtonWithMenu";

export function AddShape() {
	const { board } = usePanelContext();
	const { t } = useTalkTranslation();

	const handleClick = () => {
		board.tools.addShape();
	};

	const handlePick = (shape: ShapeType) => {
		const tool = board.tools.getAddShape();
		if (tool) {
			tool.setShapeType(shape);
		}
	};

	const isActive = Boolean(board.tools.getAddShape());

	return (
		<ButtonWithMenu
			button={
				<UiButton
					tooltip={t("toolsPanel.addShape.tooltip")}
					hotkey="S"
					active={isActive}
					onClick={handleClick}
				>
					<Icon width={18} height={18} iconName="AddShape" />
				</UiButton>
			}
			isOpen={isActive}
		>
			<UiPanel grid columns={3}>
				<ShapePicker onPick={handlePick} />
			</UiPanel>
		</ButtonWithMenu>
	);
}
